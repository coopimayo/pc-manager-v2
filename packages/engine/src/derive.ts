/**
 * derive(contentPacks, buildLog, playState) → { sheet, pendingDecisions, findings }
 *
 * The character sheet is a pure derivation: this module folds the build log
 * in order, applies declarative Effects from content, and computes every
 * final value with provenance. Illegal or incomplete states are reported as
 * findings — never silently fixed, never blocking.
 */
import { evaluateFormula, FormulaError, type FormulaContext } from "./formula.js";
import { describePredicate, evaluatePredicate, type PredicateContext } from "./predicate.js";
import { Registry } from "./registry.js";
import {
  ABILITIES,
  SKILLS,
  STANDARD_LANGUAGES,
  type Ability,
  type BuildEvent,
  type CharacterSheet,
  type ContentPack,
  type DecisionOption,
  type DecisionPoint,
  type DeriveResult,
  type DerivedValue,
  type Effect,
  type FeatEntity,
  type PendingDecision,
  type PlayState,
  type ProficiencyRef,
  type ProvenancePart,
  type ResolvedOption,
  type SheetAbility,
  type SheetFeature,
  type SheetProficiency,
  type SubclassEntity,
  type ValidationFinding,
} from "./types.js";

interface AbilityIncrease {
  source: string;
  amount: number;
  cap: number;
}

interface StatOp {
  stat: string;
  op: "set" | "delta";
  formula: string;
  source: string;
}

interface HpEntry {
  source: string;
  amount: number;
  note: string;
}

interface DecisionInstance {
  instanceId: string;
  decision: DecisionPoint;
  source: string;
  resolved: boolean;
}

interface ClassState {
  classId: string;
  level: number;
  subclassId?: string;
}

class DeriveState {
  name = "";
  packIds: string[] = [];
  findings: ValidationFinding[] = [];

  baseScores: Partial<Record<Ability, number>> = {};
  baseScoresSource = "";
  abilityIncreases: AbilityIncrease[] = [];
  abilityIncreasesByAbility = new Map<Ability, AbilityIncrease[]>();

  proficiencies = new Map<string, SheetProficiency>();
  features: SheetFeature[] = [];
  statOps: StatOp[] = [];
  hpEntries: HpEntry[] = [];

  classes = new Map<string, ClassState>();
  classOrder: string[] = [];
  speciesId?: string;
  subspeciesId?: string;
  backgroundId?: string;
  featIds: string[] = [];

  decisions = new Map<string, DecisionInstance>();

  constructor(readonly registry: Registry) {
    this.findings.push(...registry.findings);
  }

  error(code: string, message: string): void {
    this.findings.push({ severity: "error", code, message });
  }

  warning(code: string, message: string): void {
    this.findings.push({ severity: "warning", code, message });
  }

  characterLevel(): number {
    let total = 0;
    for (const c of this.classes.values()) total += c.level;
    return total;
  }

  /** Ability score as of the current fold position (base + increases so far). */
  currentScore(ability: Ability): number {
    let score = this.baseScores[ability] ?? 10;
    for (const inc of this.abilityIncreasesByAbility.get(ability) ?? []) {
      score = Math.min(Math.max(score, inc.cap), score + inc.amount);
    }
    return score;
  }

  predicateContext(): PredicateContext {
    const scores = {} as Record<Ability, number>;
    for (const a of ABILITIES) scores[a] = this.currentScore(a);
    return {
      abilityScores: scores,
      hasProficiency: (ref) => this.proficiencies.has(profKey(ref)),
      classLevel: (classId) => this.classes.get(classId)?.level ?? 0,
      characterLevel: this.characterLevel(),
    };
  }
}

function profKey(ref: ProficiencyRef): string {
  return `${ref.type}:${ref.id}`;
}

function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

// ---------------------------------------------------------------------------
// Effect application
// ---------------------------------------------------------------------------

function applyEffect(state: DeriveState, effect: Effect, source: string): void {
  switch (effect.kind) {
    case "abilityIncrease": {
      const inc: AbilityIncrease = {
        source,
        amount: effect.amount,
        cap: effect.max ?? 20,
      };
      state.abilityIncreases.push(inc);
      const list = state.abilityIncreasesByAbility.get(effect.ability) ?? [];
      list.push(inc);
      state.abilityIncreasesByAbility.set(effect.ability, list);
      break;
    }
    case "grantProficiency": {
      const key = profKey(effect.proficiency);
      const existing = state.proficiencies.get(key);
      if (existing) {
        state.warning(
          "duplicate-proficiency",
          `Proficiency "${key}" from ${source} is already granted by ${existing.source}.`,
        );
      } else {
        state.proficiencies.set(key, { proficiency: effect.proficiency, source });
      }
      break;
    }
    case "grantFeature": {
      state.features.push({
        id: effect.feature.id,
        name: effect.feature.name,
        text: effect.feature.text,
        source,
      });
      // Nested effects are attributed to the feature itself, so provenance
      // reads "Fighting Style: Archery" rather than "Fighter 1: Archery".
      for (const nested of effect.feature.effects ?? []) {
        applyEffect(state, nested, effect.feature.name);
      }
      break;
    }
    case "grantFeat": {
      const feat = state.registry.getOfType(effect.featId, "feat");
      if (!feat) {
        state.error("unknown-feat", `grantFeat references unknown feat "${effect.featId}" (from ${source}).`);
        break;
      }
      applyFeat(state, feat);
      break;
    }
    case "setStat":
      state.statOps.push({ stat: effect.stat, op: "set", formula: effect.value, source });
      break;
    case "modifyStat":
      state.statOps.push({ stat: effect.stat, op: "delta", formula: effect.delta, source });
      break;
    case "grantDecision":
      grantDecision(state, effect.decision, source);
      break;
  }
}

function grantDecision(state: DeriveState, decision: DecisionPoint, source: string): void {
  let instanceId = decision.id;
  for (let n = 2; state.decisions.has(instanceId); n++) {
    instanceId = `${decision.id}#${n}`;
  }
  state.decisions.set(instanceId, { instanceId, decision, source, resolved: false });
}

// ---------------------------------------------------------------------------
// Event folding
// ---------------------------------------------------------------------------

function foldCharacterCreated(
  state: DeriveState,
  event: Extract<BuildEvent, { type: "characterCreated" }>,
): void {
  if (state.name !== "") {
    state.error("duplicate-created", "characterCreated appears more than once in the build log.");
    return;
  }
  state.name = event.name;
  state.packIds = event.packIds;
  grantDecision(
    state,
    {
      id: "species",
      prompt: "Choose your species",
      count: 1,
      options: { source: "query", entityType: "species" },
    },
    "Character creation",
  );
  grantDecision(
    state,
    {
      id: "background",
      prompt: "Choose your background",
      count: 1,
      options: { source: "query", entityType: "background" },
    },
    "Character creation",
  );
  // 2024 rules: every character knows Common plus two standard languages.
  applyEffect(
    state,
    { kind: "grantProficiency", proficiency: { type: "language", id: "common" } },
    "Character creation",
  );
  grantDecision(
    state,
    {
      id: "languages",
      prompt: "Choose two languages",
      count: 2,
      options: {
        source: "list",
        options: Object.entries(STANDARD_LANGUAGES)
          .filter(([id]) => id !== "common")
          .map(([id, name]) => ({
            id,
            label: name,
            effects: [
              { kind: "grantProficiency" as const, proficiency: { type: "language" as const, id } },
            ],
          })),
      },
    },
    "Character creation",
  );
}

function foldAbilityScoresSet(
  state: DeriveState,
  event: Extract<BuildEvent, { type: "abilityScoresSet" }>,
): void {
  state.baseScores = { ...event.scores };
  state.baseScoresSource = `Base (${event.method})`;
}

function foldClassLevelTaken(
  state: DeriveState,
  event: Extract<BuildEvent, { type: "classLevelTaken" }>,
): void {
  const cls = state.registry.getOfType(event.classId, "class");
  if (!cls) {
    state.error("unknown-class", `classLevelTaken references unknown class "${event.classId}".`);
    return;
  }

  const existing = state.classes.get(cls.id);
  const isNewClass = !existing;
  const newCharacterLevel = state.characterLevel() + 1;

  if (isNewClass && state.classes.size > 0) {
    const ctx = state.predicateContext();
    const toCheck = [cls, ...[...state.classes.keys()].map((id) => state.registry.getOfType(id, "class"))];
    for (const c of toCheck) {
      if (c?.multiclassPrerequisite && !evaluatePredicate(c.multiclassPrerequisite, ctx)) {
        state.error(
          "multiclass-prerequisite",
          `Multiclass prerequisite not met for ${c.name}: ${describePredicate(c.multiclassPrerequisite)}.`,
        );
      }
    }
  }
  if (newCharacterLevel > 20) {
    state.warning("over-level-20", `Character level ${newCharacterLevel} exceeds 20.`);
  }

  const classState: ClassState = existing ?? { classId: cls.id, level: 0 };
  classState.level += 1;
  if (isNewClass) {
    state.classes.set(cls.id, classState);
    state.classOrder.push(cls.id);
  }

  // Hit points: max die at character level 1; otherwise roll or average.
  const source = `${cls.name} ${classState.level}`;
  if (newCharacterLevel === 1) {
    state.hpEntries.push({ source, amount: cls.hitDie, note: "max hit die at level 1" });
  } else {
    const average = cls.hitDie / 2 + 1;
    if (event.hpRoll !== undefined) {
      if (event.hpRoll < 1 || event.hpRoll > cls.hitDie) {
        state.error(
          "invalid-hp-roll",
          `HP roll ${event.hpRoll} is outside 1–${cls.hitDie} for ${cls.name}.`,
        );
      }
      state.hpEntries.push({ source, amount: event.hpRoll, note: "rolled" });
    } else {
      state.hpEntries.push({ source, amount: average, note: "average" });
    }
  }

  for (const eff of cls.levels[classState.level]?.effects ?? []) {
    applyEffect(state, eff, source);
  }
  if (classState.subclassId) {
    const sub = state.registry.getOfType(classState.subclassId, "subclass");
    for (const eff of sub?.levels[classState.level]?.effects ?? []) {
      applyEffect(state, eff, `${sub!.name} (${source})`);
    }
  }

  if (state.baseScoresSource === "") {
    state.warning(
      "no-ability-scores",
      "A class level was taken before ability scores were set.",
    );
  }
}

function foldDecisionResolved(
  state: DeriveState,
  event: Extract<BuildEvent, { type: "decisionResolved" }>,
): void {
  const instance = state.decisions.get(event.decisionId);
  if (!instance) {
    state.error(
      "unknown-decision",
      `decisionResolved references unknown decision "${event.decisionId}".`,
    );
    return;
  }
  if (instance.resolved) {
    state.error(
      "decision-already-resolved",
      `Decision "${event.decisionId}" was already resolved.`,
    );
    return;
  }
  const { decision } = instance;

  if (event.optionIds.length !== decision.count) {
    state.error(
      "selection-count",
      `Decision "${event.decisionId}" expects ${decision.count} selection(s), got ${event.optionIds.length}.`,
    );
  }
  const counts = new Map<string, number>();
  for (const id of event.optionIds) counts.set(id, (counts.get(id) ?? 0) + 1);
  for (const [id, n] of counts) {
    if (n > 1 && !decision.allowDuplicates) {
      state.error(
        "duplicate-selection",
        `Decision "${event.decisionId}" does not allow picking "${id}" more than once.`,
      );
    }
    if (decision.maxPerOption !== undefined && n > decision.maxPerOption) {
      state.error(
        "max-per-option",
        `Decision "${event.decisionId}" allows "${id}" at most ${decision.maxPerOption} time(s), got ${n}.`,
      );
    }
  }

  for (const optionId of event.optionIds) {
    if (decision.options.source === "list") {
      const option = decision.options.options.find((o) => o.id === optionId);
      if (!option) {
        state.error(
          "unknown-option",
          `Decision "${event.decisionId}" has no option "${optionId}".`,
        );
        continue;
      }
      applyListOption(state, instance, option);
    } else {
      applyQueryOption(state, instance, optionId);
    }
  }
  instance.resolved = true;
}

function applyListOption(
  state: DeriveState,
  instance: DecisionInstance,
  option: DecisionOption,
): void {
  const source = `${instance.source}: ${option.label}`;
  for (const eff of option.effects) applyEffect(state, eff, source);
}

function applyQueryOption(state: DeriveState, instance: DecisionInstance, optionId: string): void {
  const query = instance.decision.options;
  if (query.source !== "query") return;
  const entity = state.registry.get(optionId);
  if (!entity || entity.type !== query.entityType) {
    state.error(
      "unknown-option",
      `Decision "${instance.instanceId}" selected "${optionId}", which is not a known ${query.entityType}.`,
    );
    return;
  }
  const matches = state.registry
    .query({ entityType: query.entityType, ...(query.filter ? { filter: query.filter } : {}) })
    .some((e) => e.id === optionId);
  if (!matches) {
    state.error(
      "option-outside-query",
      `"${optionId}" does not match the options of decision "${instance.instanceId}".`,
    );
    return;
  }

  switch (entity.type) {
    case "species": {
      if (state.speciesId) {
        state.error("species-already-chosen", `Species is already "${state.speciesId}".`);
        return;
      }
      state.speciesId = entity.id;
      for (const eff of entity.effects) applyEffect(state, eff, entity.name);
      break;
    }
    case "subspecies": {
      if (entity.speciesId !== state.speciesId) {
        state.error(
          "subspecies-mismatch",
          `Subspecies "${entity.id}" belongs to species "${entity.speciesId}", not "${state.speciesId}".`,
        );
        return;
      }
      state.subspeciesId = entity.id;
      for (const eff of entity.effects) applyEffect(state, eff, entity.name);
      break;
    }
    case "background": {
      if (state.backgroundId) {
        state.error("background-already-chosen", `Background is already "${state.backgroundId}".`);
        return;
      }
      state.backgroundId = entity.id;
      for (const eff of entity.effects) applyEffect(state, eff, `${entity.name} (background)`);
      break;
    }
    case "feat":
      applyFeat(state, entity);
      break;
    case "subclass":
      applySubclass(state, entity);
      break;
  }
}

function applyFeat(state: DeriveState, feat: FeatEntity): void {
  if (state.featIds.includes(feat.id) && !feat.repeatable) {
    state.error("feat-already-taken", `Feat "${feat.id}" is not repeatable and was already taken.`);
  }
  if (feat.prerequisite && !evaluatePredicate(feat.prerequisite, state.predicateContext())) {
    state.error(
      "feat-prerequisite",
      `Prerequisite not met for feat "${feat.name}": ${describePredicate(feat.prerequisite)}.`,
    );
  }
  state.featIds.push(feat.id);
  state.features.push({
    id: feat.id,
    name: feat.name,
    text: feat.description ?? "",
    source: `Feat (${feat.category})`,
  });
  for (const eff of feat.effects) applyEffect(state, eff, feat.name);
}

function applySubclass(state: DeriveState, subclass: SubclassEntity): void {
  const classState = state.classes.get(subclass.classId);
  if (!classState) {
    state.error(
      "subclass-without-class",
      `Subclass "${subclass.id}" requires levels in "${subclass.classId}".`,
    );
    return;
  }
  if (classState.subclassId) {
    state.error(
      "subclass-already-chosen",
      `${subclass.classId} already has subclass "${classState.subclassId}".`,
    );
    return;
  }
  classState.subclassId = subclass.id;
  const cls = state.registry.getOfType(subclass.classId, "class");
  // Apply subclass level entries retroactively up to the current class level;
  // future class levels pick up subsequent entries as they are taken.
  for (let lvl = 1; lvl <= classState.level; lvl++) {
    for (const eff of subclass.levels[lvl]?.effects ?? []) {
      applyEffect(state, eff, `${subclass.name} (${cls?.name ?? subclass.classId} ${lvl})`);
    }
  }
}

// ---------------------------------------------------------------------------
// Final sheet computation
// ---------------------------------------------------------------------------

function evalFormula(state: DeriveState, formula: string, ctx: FormulaContext, source: string): number {
  try {
    return evaluateFormula(formula, ctx);
  } catch (e) {
    if (e instanceof FormulaError) {
      state.error("formula-error", `${e.message} (from ${source})`);
      return 0;
    }
    throw e;
  }
}

function computeAbility(state: DeriveState, ability: Ability): SheetAbility {
  const parts: ProvenancePart[] = [];
  let score: number;
  if (state.baseScoresSource !== "") {
    score = state.baseScores[ability] ?? 10;
    parts.push({ source: state.baseScoresSource, amount: score });
  } else {
    score = 10;
    parts.push({ source: "Default", amount: 10, note: "ability scores not set yet" });
  }
  for (const inc of state.abilityIncreasesByAbility.get(ability) ?? []) {
    const target = Math.min(Math.max(score, inc.cap), score + inc.amount);
    const applied = target - score;
    const part: ProvenancePart = { source: inc.source, amount: applied };
    if (applied < inc.amount) part.note = `capped at ${inc.cap}`;
    parts.push(part);
    score = target;
  }
  return { score, modifier: abilityModifier(score), parts };
}

function derivedValue(parts: ProvenancePart[]): DerivedValue {
  return { value: parts.reduce((sum, p) => sum + p.amount, 0), parts };
}

export function derive(
  packs: ContentPack[],
  buildLog: BuildEvent[],
  _playState: PlayState = {},
): DeriveResult {
  const registry = new Registry(packs);
  const state = new DeriveState(registry);

  for (const [index, event] of buildLog.entries()) {
    if (index === 0 && event.type !== "characterCreated") {
      state.error("log-must-start-with-created", "Build log must start with characterCreated.");
    }
    switch (event.type) {
      case "characterCreated":
        foldCharacterCreated(state, event);
        break;
      case "abilityScoresSet":
        foldAbilityScoresSet(state, event);
        break;
      case "classLevelTaken":
        foldClassLevelTaken(state, event);
        break;
      case "decisionResolved":
        foldDecisionResolved(state, event);
        break;
    }
  }

  // --- abilities, level, proficiency bonus ---
  const abilities = {} as Record<Ability, SheetAbility>;
  for (const a of ABILITIES) abilities[a] = computeAbility(state, a);

  const level = state.characterLevel();
  const proficiencyBonus: DerivedValue = {
    value: 2 + Math.floor(Math.max(level - 1, 0) / 4),
    parts: [
      {
        source: `Character level ${level}`,
        amount: 2 + Math.floor(Math.max(level - 1, 0) / 4),
      },
    ],
  };

  const formulaCtx: FormulaContext = { level, profBonus: proficiencyBonus.value };
  for (const a of ABILITIES) {
    formulaCtx[a] = abilities[a].score;
    formulaCtx[`${a}Mod`] = abilities[a].modifier;
  }

  // --- stats (speed, darkvision, …) with ac/initiative/hp folded specially ---
  const statParts = new Map<string, ProvenancePart[]>();
  const reserved = new Set(["ac", "initiative", "hp"]);
  const acExtra: ProvenancePart[] = [];
  const initiativeExtra: ProvenancePart[] = [];
  const hpExtra: ProvenancePart[] = [];
  for (const op of state.statOps) {
    const amount = evalFormula(state, op.formula, formulaCtx, op.source);
    if (reserved.has(op.stat)) {
      if (op.op === "set") {
        state.error("reserved-stat-set", `Stat "${op.stat}" cannot be set, only modified (from ${op.source}).`);
        continue;
      }
      const bucket = op.stat === "ac" ? acExtra : op.stat === "initiative" ? initiativeExtra : hpExtra;
      bucket.push({ source: op.source, amount });
      continue;
    }
    if (op.op === "set") {
      statParts.set(op.stat, [{ source: op.source, amount }]);
    } else {
      const parts = statParts.get(op.stat) ?? [];
      parts.push({ source: op.source, amount });
      statParts.set(op.stat, parts);
    }
  }
  if (!statParts.has("speed")) {
    statParts.set("speed", [{ source: "Default", amount: 30 }]);
  }
  const stats: Record<string, DerivedValue> = {};
  for (const [stat, parts] of statParts) stats[stat] = derivedValue(parts);

  // --- hit points ---
  const hpParts: ProvenancePart[] = state.hpEntries.map((e) => ({
    source: e.source,
    amount: e.amount,
    note: e.note,
  }));
  if (level > 0 && abilities.con.modifier !== 0) {
    hpParts.push({
      source: `Constitution modifier (${abilities.con.modifier >= 0 ? "+" : ""}${abilities.con.modifier}) × level ${level}`,
      amount: abilities.con.modifier * level,
    });
  }
  hpParts.push(...hpExtra);
  const hitPoints = derivedValue(hpParts);

  // --- armor class & initiative (equipment lands in a later milestone) ---
  const armorClass = derivedValue([
    { source: "Base", amount: 10 },
    { source: "DEX modifier", amount: abilities.dex.modifier },
    ...acExtra,
  ]);
  const initiative = derivedValue([
    { source: "DEX modifier", amount: abilities.dex.modifier },
    ...initiativeExtra,
  ]);

  // --- saving throws & skills ---
  const savingThrows = {} as Record<Ability, DerivedValue>;
  for (const a of ABILITIES) {
    const parts: ProvenancePart[] = [
      { source: `${a.toUpperCase()} modifier`, amount: abilities[a].modifier },
    ];
    const prof = state.proficiencies.get(profKey({ type: "savingThrow", id: a }));
    if (prof) {
      parts.push({ source: `Proficiency (${prof.source})`, amount: proficiencyBonus.value });
    }
    savingThrows[a] = derivedValue(parts);
  }
  const skills: Record<string, DerivedValue> = {};
  for (const [skillId, ability] of Object.entries(SKILLS)) {
    const parts: ProvenancePart[] = [
      { source: `${ability.toUpperCase()} modifier`, amount: abilities[ability].modifier },
    ];
    const prof = state.proficiencies.get(profKey({ type: "skill", id: skillId }));
    if (prof) {
      parts.push({ source: `Proficiency (${prof.source})`, amount: proficiencyBonus.value });
    }
    skills[skillId] = derivedValue(parts);
  }

  // --- pending decisions with resolved, eligibility-annotated options ---
  const pendingDecisions: PendingDecision[] = [];
  for (const instance of state.decisions.values()) {
    if (instance.resolved) continue;
    pendingDecisions.push({
      instanceId: instance.instanceId,
      decision: instance.decision,
      source: instance.source,
      options: resolveOptions(state, instance),
    });
  }

  const sheet: CharacterSheet = {
    name: state.name,
    level,
    classes: state.classOrder.map((id) => {
      const c = state.classes.get(id)!;
      return {
        classId: c.classId,
        level: c.level,
        ...(c.subclassId !== undefined ? { subclassId: c.subclassId } : {}),
      };
    }),
    ...(state.speciesId !== undefined ? { speciesId: state.speciesId } : {}),
    ...(state.subspeciesId !== undefined ? { subspeciesId: state.subspeciesId } : {}),
    ...(state.backgroundId !== undefined ? { backgroundId: state.backgroundId } : {}),
    abilities,
    proficiencyBonus,
    hitPoints,
    armorClass,
    initiative,
    savingThrows,
    skills,
    stats,
    proficiencies: [...state.proficiencies.values()],
    features: state.features,
    featIds: state.featIds,
    attributions: registry.attributions,
  };

  return { sheet, pendingDecisions, findings: state.findings };
}

function resolveOptions(state: DeriveState, instance: DecisionInstance): ResolvedOption[] {
  const { decision } = instance;
  if (decision.options.source === "list") {
    return decision.options.options.map((o) => ({ id: o.id, label: o.label, eligible: true }));
  }
  const query = decision.options;
  const ctx = state.predicateContext();
  return state.registry
    .query({ entityType: query.entityType, ...(query.filter ? { filter: query.filter } : {}) })
    .map((entity) => {
      const option: ResolvedOption = { id: entity.id, label: entity.name, eligible: true };
      if (entity.type === "feat") {
        if (state.featIds.includes(entity.id) && !entity.repeatable) {
          option.eligible = false;
          option.reason = "already taken";
        } else if (entity.prerequisite && !evaluatePredicate(entity.prerequisite, ctx)) {
          option.eligible = false;
          option.reason = `requires ${describePredicate(entity.prerequisite)}`;
        }
      }
      if (entity.type === "subspecies" && state.speciesId !== entity.speciesId) {
        option.eligible = false;
        option.reason = `requires species ${entity.speciesId}`;
      }
      if (entity.type === "subclass" && !state.classes.has(entity.classId)) {
        option.eligible = false;
        option.reason = `requires levels in ${entity.classId}`;
      }
      return option;
    });
}
