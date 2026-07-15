import { describe, expect, it } from "vitest";
import { derive } from "../src/derive.js";
import type {
  AbilityScores,
  BuildEvent,
  ContentPack,
  DeriveResult,
} from "../src/types.js";

// --- tiny inline pack exercising every engine mechanism ---

const pack: ContentPack = {
  id: "test-pack",
  name: "Test Pack",
  version: "0.0.0",
  license: { name: "none", attribution: "Test attribution" },
  entities: [
    {
      type: "species",
      id: "testkin",
      name: "Testkin",
      effects: [
        { kind: "setStat", stat: "speed", value: "25" },
        {
          kind: "grantDecision",
          decision: {
            id: "testkin:variant",
            prompt: "Choose a variant",
            count: 1,
            options: { source: "query", entityType: "subspecies", filter: { speciesId: "testkin" } },
          },
        },
      ],
    },
    {
      type: "subspecies",
      id: "testkin-swift",
      name: "Swift Testkin",
      speciesId: "testkin",
      effects: [{ kind: "setStat", stat: "speed", value: "35" }],
    },
    { type: "species", id: "otherkin", name: "Otherkin", effects: [] },
    {
      type: "subspecies",
      id: "otherkin-variant",
      name: "Otherkin Variant",
      speciesId: "otherkin",
      effects: [],
    },
    {
      type: "background",
      id: "wanderer",
      name: "Wanderer",
      effects: [{ kind: "grantProficiency", proficiency: { type: "skill", id: "survival" } }],
    },
    {
      type: "class",
      id: "warrior",
      name: "Warrior",
      hitDie: 10,
      primaryAbilities: ["str"],
      multiclassPrerequisite: { type: "abilityAtLeast", ability: "str", value: 13 },
      levels: {
        1: {
          effects: [
            { kind: "grantProficiency", proficiency: { type: "savingThrow", id: "str" } },
            { kind: "grantProficiency", proficiency: { type: "skill", id: "survival" } },
            {
              kind: "grantDecision",
              decision: {
                id: "warrior:training",
                prompt: "Choose a training",
                count: 1,
                options: {
                  source: "list",
                  options: [
                    { id: "tough", label: "Tough", effects: [{ kind: "modifyStat", stat: "hp", delta: "2 * level" }] },
                    { id: "quick", label: "Quick", effects: [{ kind: "modifyStat", stat: "initiative", delta: "1" }] },
                    { id: "mighty", label: "Mighty", effects: [{ kind: "abilityIncrease", ability: "str", amount: 2, max: 20 }] },
                  ],
                },
              },
            },
          ],
        },
        2: {
          effects: [
            {
              kind: "grantDecision",
              decision: {
                id: "warrior:training",
                prompt: "Choose a training",
                count: 1,
                options: {
                  source: "list",
                  options: [{ id: "quick", label: "Quick", effects: [] }],
                },
              },
            },
          ],
        },
        3: {
          effects: [
            {
              kind: "grantDecision",
              decision: {
                id: "warrior:subclass",
                prompt: "Choose a subclass",
                count: 1,
                options: { source: "query", entityType: "subclass", filter: { classId: "warrior" } },
              },
            },
          ],
        },
      },
    },
    {
      type: "subclass",
      id: "warrior-guard",
      name: "Guard",
      classId: "warrior",
      levels: {
        2: { effects: [{ kind: "modifyStat", stat: "ac", delta: "1" }] },
        3: {
          effects: [
            {
              kind: "grantFeature",
              feature: { id: "guard:stance", name: "Guard Stance", text: "Hold the line." },
            },
          ],
        },
      },
    },
    {
      type: "class",
      id: "mage",
      name: "Mage",
      hitDie: 6,
      primaryAbilities: ["int"],
      multiclassPrerequisite: { type: "abilityAtLeast", ability: "int", value: 13 },
      levels: {
        1: {
          effects: [
            {
              kind: "grantDecision",
              decision: {
                id: "mage:feat",
                prompt: "Choose a feat",
                count: 1,
                options: { source: "query", entityType: "feat", filter: { category: "general" } },
              },
            },
          ],
        },
      },
    },
    {
      type: "feat",
      id: "brawny",
      name: "Brawny",
      category: "general",
      prerequisite: { type: "abilityAtLeast", ability: "str", value: 13 },
      effects: [{ kind: "abilityIncrease", ability: "str", amount: 2, max: 20 }],
    },
  ],
};

const scores = (over: Partial<AbilityScores> = {}): AbilityScores => ({
  str: 15,
  dex: 12,
  con: 14,
  int: 8,
  wis: 10,
  cha: 13,
  ...over,
});

const created: BuildEvent = { type: "characterCreated", name: "Testy", packIds: ["test-pack"] };
const setScores = (over: Partial<AbilityScores> = {}): BuildEvent => ({
  type: "abilityScoresSet",
  method: "manual",
  scores: scores(over),
});

const run = (...events: BuildEvent[]): DeriveResult => derive([pack], events);

const findingCodes = (r: DeriveResult) => r.findings.map((f) => f.code);
const pendingIds = (r: DeriveResult) => r.pendingDecisions.map((p) => p.instanceId);

describe("derive: creation basics", () => {
  it("characterCreated opens species, background, and language decisions", () => {
    const r = run(created);
    expect(pendingIds(r)).toEqual(["species", "background", "languages"]);
    const species = r.pendingDecisions[0]!;
    expect(species.options.map((o) => o.id)).toEqual(["otherkin", "testkin"]);
    expect(species.options.every((o) => o.eligible)).toBe(true);
    // 2024 rules: Common is known from the start; two more are a choice.
    const languages = r.sheet.proficiencies.filter((p) => p.proficiency.type === "language");
    expect(languages.map((p) => p.proficiency.id)).toEqual(["common"]);
    const languageDecision = r.pendingDecisions[2]!;
    expect(languageDecision.decision.count).toBe(2);
    expect(languageDecision.options.map((o) => o.id)).not.toContain("common");
    expect(r.sheet.level).toBe(0);
    expect(r.sheet.stats["speed"]?.value).toBe(30);
    expect(r.sheet.attributions).toEqual(["Test attribution"]);
  });

  it("requires the log to start with characterCreated", () => {
    const r = run(setScores(), created);
    expect(findingCodes(r)).toContain("log-must-start-with-created");
  });

  it("resolving a species applies its effects and opens content-declared decisions", () => {
    const r = run(created, setScores(), {
      type: "decisionResolved",
      decisionId: "species",
      optionIds: ["testkin"],
    });
    expect(r.sheet.speciesId).toBe("testkin");
    expect(r.sheet.stats["speed"]?.value).toBe(25);
    const variant = r.pendingDecisions.find((p) => p.instanceId === "testkin:variant");
    expect(variant).toBeDefined();
    const other = variant!.options.find((o) => o.id === "otherkin-variant");
    expect(other).toBeUndefined(); // filtered out by the speciesId query filter
    expect(variant!.options.map((o) => o.id)).toEqual(["testkin-swift"]);
  });

  it("subspecies of a different species is rejected with a finding", () => {
    const r = run(
      created,
      setScores(),
      { type: "decisionResolved", decisionId: "species", optionIds: ["testkin"] },
      { type: "decisionResolved", decisionId: "testkin:variant", optionIds: ["otherkin-variant"] },
    );
    expect(findingCodes(r)).toContain("option-outside-query");
  });

  it("subspecies stat set overrides the species value", () => {
    const r = run(
      created,
      setScores(),
      { type: "decisionResolved", decisionId: "species", optionIds: ["testkin"] },
      { type: "decisionResolved", decisionId: "testkin:variant", optionIds: ["testkin-swift"] },
    );
    expect(r.sheet.subspeciesId).toBe("testkin-swift");
    expect(r.sheet.stats["speed"]?.value).toBe(35);
    expect(r.findings).toEqual([]);
  });
});

describe("derive: hit points", () => {
  it("max die at level 1, average by default, roll when given, retroactive CON", () => {
    const r = run(
      created,
      setScores(), // con 14 → +2
      { type: "classLevelTaken", classId: "warrior" },
      { type: "classLevelTaken", classId: "warrior" },
      { type: "classLevelTaken", classId: "warrior", hpRoll: 4 },
    );
    // 10 (max) + 6 (average) + 4 (roll) + 2×3 (con × level)
    expect(r.sheet.hitPoints.value).toBe(26);
    const notes = r.sheet.hitPoints.parts.map((p) => p.note);
    expect(notes).toContain("max hit die at level 1");
    expect(notes).toContain("average");
    expect(notes).toContain("rolled");
  });

  it("flags an hp roll outside the hit die range", () => {
    const r = run(
      created,
      setScores(),
      { type: "classLevelTaken", classId: "warrior" },
      { type: "classLevelTaken", classId: "warrior", hpRoll: 11 },
    );
    expect(findingCodes(r)).toContain("invalid-hp-roll");
  });

  it("hp stat modifiers use the final character level", () => {
    const r = run(
      created,
      setScores({ con: 10 }),
      { type: "classLevelTaken", classId: "warrior" },
      { type: "decisionResolved", decisionId: "warrior:training", optionIds: ["tough"] },
      { type: "classLevelTaken", classId: "warrior" },
      { type: "classLevelTaken", classId: "warrior" },
    );
    // 10 + 6 + 6 (dice) + 2×3 (Tough: 2 × level, evaluated at final level)
    expect(r.sheet.hitPoints.value).toBe(28);
  });
});

describe("derive: abilities and provenance", () => {
  it("caps ability increases and records the cap in provenance", () => {
    const r = run(
      created,
      setScores({ str: 19 }),
      { type: "classLevelTaken", classId: "warrior" },
      { type: "decisionResolved", decisionId: "warrior:training", optionIds: ["mighty"] },
    );
    expect(r.sheet.abilities.str.score).toBe(20);
    const capped = r.sheet.abilities.str.parts.find((p) => p.note?.includes("capped"));
    expect(capped).toBeDefined();
    expect(capped!.amount).toBe(1);
  });

  it("saving throw and skill proficiencies add the proficiency bonus with provenance", () => {
    const r = run(created, setScores(), { type: "classLevelTaken", classId: "warrior" });
    expect(r.sheet.savingThrows.str.value).toBe(4); // +2 mod, +2 prof
    expect(r.sheet.savingThrows.dex.value).toBe(1); // mod only
    expect(r.sheet.skills["survival"]?.value).toBe(2); // +0 wis, +2 prof
    expect(r.sheet.proficiencyBonus.value).toBe(2);
  });
});

describe("derive: decision misuse is reported, never silently fixed", () => {
  it("unknown decision id", () => {
    const r = run(created, { type: "decisionResolved", decisionId: "nope", optionIds: ["x"] });
    expect(findingCodes(r)).toContain("unknown-decision");
  });

  it("wrong selection count", () => {
    const r = run(
      created,
      setScores(),
      { type: "classLevelTaken", classId: "warrior" },
      { type: "decisionResolved", decisionId: "warrior:training", optionIds: ["tough", "quick"] },
    );
    expect(findingCodes(r)).toContain("selection-count");
  });

  it("resolving the same decision twice", () => {
    const r = run(
      created,
      setScores(),
      { type: "classLevelTaken", classId: "warrior" },
      { type: "decisionResolved", decisionId: "warrior:training", optionIds: ["quick"] },
      { type: "decisionResolved", decisionId: "warrior:training", optionIds: ["tough"] },
    );
    expect(findingCodes(r)).toContain("decision-already-resolved");
  });

  it("feat prerequisites are checked and surfaced in option eligibility", () => {
    const weak = run(
      created,
      setScores({ str: 8, int: 13 }),
      { type: "classLevelTaken", classId: "mage" },
    );
    const featDecision = weak.pendingDecisions.find((p) => p.instanceId === "mage:feat")!;
    const brawny = featDecision.options.find((o) => o.id === "brawny")!;
    expect(brawny.eligible).toBe(false);
    expect(brawny.reason).toContain("STR 13+");

    const resolved = run(
      created,
      setScores({ str: 8, int: 13 }),
      { type: "classLevelTaken", classId: "mage" },
      { type: "decisionResolved", decisionId: "mage:feat", optionIds: ["brawny"] },
    );
    expect(findingCodes(resolved)).toContain("feat-prerequisite");
  });
});

describe("derive: classes, subclasses, multiclassing", () => {
  it("a decision granted twice gets a distinct instance id", () => {
    const r = run(
      created,
      setScores(),
      { type: "classLevelTaken", classId: "warrior" },
      { type: "classLevelTaken", classId: "warrior" },
    );
    expect(pendingIds(r)).toContain("warrior:training");
    expect(pendingIds(r)).toContain("warrior:training#2");
  });

  it("subclass levels apply retroactively up to the current class level", () => {
    const r = run(
      created,
      setScores(),
      { type: "classLevelTaken", classId: "warrior" },
      { type: "classLevelTaken", classId: "warrior" },
      { type: "classLevelTaken", classId: "warrior" },
      { type: "decisionResolved", decisionId: "warrior:subclass", optionIds: ["warrior-guard"] },
    );
    expect(r.sheet.classes).toEqual([{ classId: "warrior", subclassId: "warrior-guard", level: 3 }]);
    // 10 base + 1 dex mod + 1 from the level-2 Guard entry, applied retroactively
    expect(r.sheet.armorClass.value).toBe(12);
    expect(r.sheet.features.some((f) => f.id === "guard:stance")).toBe(true);
  });

  it("unmet multiclass prerequisites are flagged but not blocked", () => {
    const r = run(
      created,
      setScores({ int: 8 }),
      { type: "classLevelTaken", classId: "warrior" },
      { type: "classLevelTaken", classId: "mage" },
    );
    expect(findingCodes(r)).toContain("multiclass-prerequisite");
    expect(r.sheet.level).toBe(2);
    expect(r.sheet.classes.map((c) => c.classId)).toEqual(["warrior", "mage"]);
  });

  it("duplicate proficiency grants produce a warning", () => {
    const r = run(
      created,
      setScores(),
      { type: "decisionResolved", decisionId: "background", optionIds: ["wanderer"] },
      { type: "classLevelTaken", classId: "warrior" },
    );
    const dup = r.findings.find((f) => f.code === "duplicate-proficiency");
    expect(dup?.severity).toBe("warning");
  });
});

describe("derive: purity", () => {
  it("same inputs always produce the same output", () => {
    const events: BuildEvent[] = [
      created,
      setScores(),
      { type: "classLevelTaken", classId: "warrior" },
      { type: "decisionResolved", decisionId: "warrior:training", optionIds: ["quick"] },
      { type: "decisionResolved", decisionId: "species", optionIds: ["testkin"] },
    ];
    expect(derive([pack], events)).toEqual(derive([pack], events));
  });
});
