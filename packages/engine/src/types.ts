/**
 * Core domain types for the rules engine.
 *
 * Everything here is plain data. Content packs are built from these types and
 * the engine folds them — there is no class-, species-, or feat-specific code
 * anywhere in the engine.
 */

// ---------------------------------------------------------------------------
// Abilities & skills
// ---------------------------------------------------------------------------

export type Ability = "str" | "dex" | "con" | "int" | "wis" | "cha";

export const ABILITIES: readonly Ability[] = [
  "str",
  "dex",
  "con",
  "int",
  "wis",
  "cha",
];

export type AbilityScores = Record<Ability, number>;

/** Core-rules skill list: skill id → governing ability. */
export const SKILLS: Record<string, Ability> = {
  acrobatics: "dex",
  "animal-handling": "wis",
  arcana: "int",
  athletics: "str",
  deception: "cha",
  history: "int",
  insight: "wis",
  intimidation: "cha",
  investigation: "int",
  medicine: "wis",
  nature: "int",
  perception: "wis",
  performance: "cha",
  persuasion: "cha",
  religion: "int",
  "sleight-of-hand": "dex",
  stealth: "dex",
  survival: "wis",
};

/** Core-rules standard languages (2024): language id → display name. Every
 * character knows Common and chooses two more at creation. */
export const STANDARD_LANGUAGES: Record<string, string> = {
  common: "Common",
  "common-sign-language": "Common Sign Language",
  draconic: "Draconic",
  dwarvish: "Dwarvish",
  elvish: "Elvish",
  giant: "Giant",
  gnomish: "Gnomish",
  goblin: "Goblin",
  halfling: "Halfling",
  orc: "Orc",
};

// ---------------------------------------------------------------------------
// Proficiencies
// ---------------------------------------------------------------------------

export type ProficiencyType =
  | "skill"
  | "savingThrow"
  | "armor"
  | "weapon"
  | "tool"
  | "language";

export interface ProficiencyRef {
  type: ProficiencyType;
  /** e.g. "athletics", "str", "martial-weapons", "thieves-tools" */
  id: string;
}

// ---------------------------------------------------------------------------
// Formulas
// ---------------------------------------------------------------------------

/**
 * A tiny declarative expression: numbers, identifiers, + - *, parentheses.
 * Identifiers available at evaluation: `level`, `profBonus`, `strMod`..`chaMod`,
 * `str`..`cha`. Formulas are evaluated against the character's final state.
 */
export type Formula = string;

// ---------------------------------------------------------------------------
// Predicates (prerequisites)
// ---------------------------------------------------------------------------

export type Predicate =
  | { type: "abilityAtLeast"; ability: Ability; value: number }
  | { type: "hasProficiency"; proficiency: ProficiencyRef }
  | { type: "classLevelAtLeast"; classId: string; level: number }
  | { type: "characterLevelAtLeast"; level: number }
  | { type: "all"; predicates: Predicate[] }
  | { type: "any"; predicates: Predicate[] };

// ---------------------------------------------------------------------------
// Effects — the vocabulary the engine understands
// ---------------------------------------------------------------------------

export interface Feature {
  id: string;
  name: string;
  text: string;
  /** Effects that come along with the feature (may open further decisions). */
  effects?: Effect[];
}

export type Effect =
  | { kind: "abilityIncrease"; ability: Ability; amount: number; max?: number }
  | { kind: "grantProficiency"; proficiency: ProficiencyRef }
  | { kind: "grantFeature"; feature: Feature }
  /** Grant a specific feat by id (e.g. a 2024 background's fixed origin feat). */
  | { kind: "grantFeat"; featId: string }
  | { kind: "setStat"; stat: string; value: Formula }
  | { kind: "modifyStat"; stat: string; delta: Formula }
  | { kind: "grantDecision"; decision: DecisionPoint };

/**
 * Stat ids with engine-assigned meaning: "speed", "darkvision", "ac", "hp"
 * (hp modifiers fold into derived hit points), "initiative". Packs may also
 * introduce their own stat ids; they surface in `sheet.stats` untouched.
 */

// ---------------------------------------------------------------------------
// DecisionPoints — content-declared choices
// ---------------------------------------------------------------------------

export interface DecisionOption {
  id: string;
  label: string;
  effects: Effect[];
}

export type OptionSource =
  | { source: "list"; options: DecisionOption[] }
  | {
      source: "query";
      entityType: "species" | "subspecies" | "subclass" | "feat" | "background";
      filter?: {
        speciesId?: string;
        classId?: string;
        category?: FeatCategory;
      };
    };

export interface DecisionPoint {
  id: string;
  prompt: string;
  /** Number of options that must be selected. */
  count: number;
  /** Allow picking the same option more than once (e.g. ASI +1/+1 to one ability). */
  allowDuplicates?: boolean;
  /** Cap on how many times a single option may be picked when duplicates are allowed. */
  maxPerOption?: number;
  options: OptionSource;
}

// ---------------------------------------------------------------------------
// Content entities
// ---------------------------------------------------------------------------

export type FeatCategory = "origin" | "general" | "fighting-style" | "epic-boon";

export interface EntityBase {
  id: string;
  name: string;
  description?: string;
}

export interface SpeciesEntity extends EntityBase {
  type: "species";
  effects: Effect[];
}

export interface SubspeciesEntity extends EntityBase {
  type: "subspecies";
  speciesId: string;
  effects: Effect[];
}

export interface ClassLevelEntry {
  effects: Effect[];
}

export interface ClassEntity extends EntityBase {
  type: "class";
  hitDie: 6 | 8 | 10 | 12;
  primaryAbilities: Ability[];
  multiclassPrerequisite?: Predicate;
  /** Effects granted at each class level (1–20). Includes grantDecision for
   * subclass choice, feat choices, skill picks, etc. */
  levels: Partial<Record<number, ClassLevelEntry>>;
}

export interface SubclassEntity extends EntityBase {
  type: "subclass";
  classId: string;
  levels: Partial<Record<number, ClassLevelEntry>>;
}

export interface FeatEntity extends EntityBase {
  type: "feat";
  category: FeatCategory;
  prerequisite?: Predicate;
  repeatable?: boolean;
  effects: Effect[];
}

export interface BackgroundEntity extends EntityBase {
  type: "background";
  effects: Effect[];
}

export type Entity =
  | SpeciesEntity
  | SubspeciesEntity
  | ClassEntity
  | SubclassEntity
  | FeatEntity
  | BackgroundEntity;

export interface ContentPack {
  id: string;
  name: string;
  version: string;
  license: {
    name: string;
    attribution?: string;
    url?: string;
  };
  entities: Entity[];
}

// ---------------------------------------------------------------------------
// Build log — a character is this, and nothing more
// ---------------------------------------------------------------------------

export type AbilityScoreMethod = "standardArray" | "pointBuy" | "manual";

export type BuildEvent =
  | { type: "characterCreated"; name: string; packIds: string[] }
  | { type: "abilityScoresSet"; method: AbilityScoreMethod; scores: AbilityScores }
  | {
      type: "classLevelTaken";
      classId: string;
      /** Rolled hit points for this level; omitted → average (die/2 + 1).
       * Ignored for the character's first level (max die, per the rules). */
      hpRoll?: number;
    }
  | { type: "decisionResolved"; decisionId: string; optionIds: string[] };

// ---------------------------------------------------------------------------
// Play state — placeholder until M5 (conditions, concentration, buffs)
// ---------------------------------------------------------------------------

export interface PlayState {}

// ---------------------------------------------------------------------------
// Derivation output
// ---------------------------------------------------------------------------

export interface ProvenancePart {
  /** Human-readable origin, e.g. "Fighter 1", "Soldier (background)". */
  source: string;
  amount: number;
  note?: string;
}

export interface DerivedValue {
  value: number;
  parts: ProvenancePart[];
}

export interface SheetAbility {
  score: number;
  modifier: number;
  parts: ProvenancePart[];
}

export interface SheetProficiency {
  proficiency: ProficiencyRef;
  source: string;
}

export interface SheetFeature {
  id: string;
  name: string;
  text: string;
  source: string;
}

export interface ClassEntry {
  classId: string;
  subclassId?: string;
  level: number;
}

export interface CharacterSheet {
  name: string;
  level: number;
  classes: ClassEntry[];
  speciesId?: string;
  subspeciesId?: string;
  backgroundId?: string;
  abilities: Record<Ability, SheetAbility>;
  proficiencyBonus: DerivedValue;
  hitPoints: DerivedValue;
  armorClass: DerivedValue;
  initiative: DerivedValue;
  savingThrows: Record<Ability, DerivedValue>;
  skills: Record<string, DerivedValue>;
  /** speed, darkvision, and any pack-defined stats. */
  stats: Record<string, DerivedValue>;
  proficiencies: SheetProficiency[];
  features: SheetFeature[];
  featIds: string[];
  /** License attributions of every pack that contributed to this sheet. */
  attributions: string[];
}

export interface ResolvedOption {
  id: string;
  label: string;
  eligible: boolean;
  /** Why the option is ineligible (shown greyed-out in the UI). */
  reason?: string;
}

export interface PendingDecision {
  /** Unique instance id — what a decisionResolved event must reference.
   * Equals decision.id unless the same decision was granted more than once. */
  instanceId: string;
  decision: DecisionPoint;
  /** What granted this decision, e.g. "Fighter 3". */
  source: string;
  options: ResolvedOption[];
}

export type FindingSeverity = "error" | "warning";

export interface ValidationFinding {
  severity: FindingSeverity;
  code: string;
  message: string;
}

export interface DeriveResult {
  sheet: CharacterSheet;
  pendingDecisions: PendingDecision[];
  findings: ValidationFinding[];
}
