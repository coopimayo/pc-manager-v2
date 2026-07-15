/**
 * Golden character: a level 5 Human Champion Fighter (Soldier background),
 * built purely as an event log and derived. This is the regression net for
 * both the engine and the SRD content — every number here was checked by hand.
 */
import { describe, expect, it } from "vitest";
import { derive, type BuildEvent } from "@pc-manager/engine";
import { srdPack } from "../src/index.js";

const creationEvents: BuildEvent[] = [
  { type: "characterCreated", name: "Torvald", packIds: ["srd-5.2"] },
  {
    type: "abilityScoresSet",
    method: "standardArray",
    scores: { str: 15, dex: 13, con: 14, int: 10, wis: 12, cha: 8 },
  },
  { type: "decisionResolved", decisionId: "species", optionIds: ["human"] },
  { type: "decisionResolved", decisionId: "human:skillful:choice", optionIds: ["perception"] },
  { type: "decisionResolved", decisionId: "human:versatile:feat", optionIds: ["alert"] },
  { type: "decisionResolved", decisionId: "background", optionIds: ["soldier"] },
  // Soldier: +2 STR (17), +1 CON (15)
  { type: "decisionResolved", decisionId: "soldier:abilities", optionIds: ["str", "str", "con"] },
  { type: "decisionResolved", decisionId: "languages", optionIds: ["dwarvish", "giant"] },
  { type: "classLevelTaken", classId: "fighter" },
  { type: "decisionResolved", decisionId: "fighter:skills", optionIds: ["acrobatics", "survival"] },
  { type: "decisionResolved", decisionId: "fighter:fighting-style:choice", optionIds: ["fs-defense"] },
  { type: "classLevelTaken", classId: "fighter" },
  { type: "classLevelTaken", classId: "fighter" },
  { type: "decisionResolved", decisionId: "fighter:subclass", optionIds: ["champion"] },
  { type: "classLevelTaken", classId: "fighter" },
  { type: "decisionResolved", decisionId: "fighter:feat-4", optionIds: ["ability-score-improvement"] },
  // ASI: +2 STR (19)
  { type: "decisionResolved", decisionId: "asi:allocate", optionIds: ["str", "str"] },
  { type: "classLevelTaken", classId: "fighter" },
];

describe("golden: level 5 Human Champion Fighter", () => {
  const { sheet, pendingDecisions, findings } = derive([srdPack], creationEvents);

  it("is a complete, legal build", () => {
    expect(findings).toEqual([]);
    expect(pendingDecisions).toEqual([]);
  });

  it("knows Common plus the two chosen languages", () => {
    const languages = sheet.proficiencies
      .filter((p) => p.proficiency.type === "language")
      .map((p) => p.proficiency.id);
    expect(languages).toEqual(["common", "dwarvish", "giant"]);
  });

  it("has the right identity and level", () => {
    expect(sheet.name).toBe("Torvald");
    expect(sheet.level).toBe(5);
    expect(sheet.classes).toEqual([{ classId: "fighter", subclassId: "champion", level: 5 }]);
    expect(sheet.speciesId).toBe("human");
    expect(sheet.backgroundId).toBe("soldier");
    expect(sheet.featIds).toEqual(["alert", "savage-attacker", "fs-defense", "ability-score-improvement"]);
  });

  it("computes ability scores through background and ASI increases", () => {
    expect(sheet.abilities.str).toMatchObject({ score: 19, modifier: 4 });
    expect(sheet.abilities.dex).toMatchObject({ score: 13, modifier: 1 });
    expect(sheet.abilities.con).toMatchObject({ score: 15, modifier: 2 });
    expect(sheet.abilities.int).toMatchObject({ score: 10, modifier: 0 });
    expect(sheet.abilities.wis).toMatchObject({ score: 12, modifier: 1 });
    expect(sheet.abilities.cha).toMatchObject({ score: 8, modifier: -1 });
    // provenance: base + two Soldier points + two ASI points
    expect(sheet.abilities.str.parts.map((p) => p.source)).toEqual([
      "Base (standardArray)",
      "Soldier (background): +1 Strength",
      "Soldier (background): +1 Strength",
      "Ability Score Improvement: +1 Strength",
      "Ability Score Improvement: +1 Strength",
    ]);
  });

  it("computes hit points with provenance (max, averages, retroactive CON)", () => {
    // 10 + 6+6+6+6 + (2 × 5)
    expect(sheet.hitPoints.value).toBe(44);
    expect(sheet.hitPoints.parts.map((p) => p.source)).toEqual([
      "Fighter 1",
      "Fighter 2",
      "Fighter 3",
      "Fighter 4",
      "Fighter 5",
      "Constitution modifier (+2) × level 5",
    ]);
  });

  it("derives AC, initiative, and proficiency bonus with every source visible", () => {
    expect(sheet.proficiencyBonus.value).toBe(3);
    // 10 base + 1 DEX + 1 Defense fighting style
    expect(sheet.armorClass.value).toBe(12);
    expect(sheet.armorClass.parts).toContainEqual({ source: "Defense", amount: 1 });
    // 1 DEX + 3 proficiency bonus from Alert (scales with level, evaluated at the end)
    expect(sheet.initiative.value).toBe(4);
    expect(sheet.initiative.parts).toContainEqual({ source: "Alert", amount: 3 });
  });

  it("computes saving throws and skills from proficiencies", () => {
    expect(sheet.savingThrows.str.value).toBe(7);
    expect(sheet.savingThrows.con.value).toBe(5);
    expect(sheet.savingThrows.dex.value).toBe(1);
    expect(sheet.skills["athletics"]?.value).toBe(7); // Soldier
    expect(sheet.skills["perception"]?.value).toBe(4); // Human: Skillful
    expect(sheet.skills["acrobatics"]?.value).toBe(4); // Fighter skills
    expect(sheet.skills["intimidation"]?.value).toBe(2); // Soldier (−1 CHA +3 prof)
    expect(sheet.skills["history"]?.value).toBe(0); // not proficient
  });

  it("lists class, subclass, species, and feat features with sources", () => {
    const names = sheet.features.map((f) => f.name);
    for (const expected of [
      "Resourceful",
      "Skillful",
      "Versatile",
      "Alert",
      "Savage Attacker",
      "Fighting Style",
      "Second Wind",
      "Weapon Mastery",
      "Action Surge",
      "Tactical Mind",
      "Improved Critical",
      "Remarkable Athlete",
      "Extra Attack",
      "Tactical Shift",
    ]) {
      expect(names).toContain(expected);
    }
    const improvedCritical = sheet.features.find((f) => f.id === "champion:improved-critical");
    expect(improvedCritical?.source).toBe("Champion (Fighter 3)");
  });

  it("carries the SRD attribution", () => {
    expect(sheet.attributions.join(" ")).toContain("System Reference Document 5.2");
  });
});

describe("golden: leveling the same character to 7 (Grappler, Champion 7)", () => {
  const levelUpEvents: BuildEvent[] = [
    ...creationEvents,
    { type: "classLevelTaken", classId: "fighter" },
    { type: "decisionResolved", decisionId: "fighter:feat-6", optionIds: ["grappler"] },
    { type: "decisionResolved", decisionId: "grappler:ability", optionIds: ["str"] },
    { type: "classLevelTaken", classId: "fighter" },
    { type: "decisionResolved", decisionId: "champion:fighting-style:choice", optionIds: ["fs-archery"] },
  ];
  const { sheet, pendingDecisions, findings } = derive([srdPack], levelUpEvents);

  it("level-up is just appending events", () => {
    expect(findings).toEqual([]);
    expect(pendingDecisions).toEqual([]);
    expect(sheet.level).toBe(7);
    expect(sheet.abilities.str.score).toBe(20); // 19 + Grappler
    expect(sheet.hitPoints.value).toBe(60); // 44 + 6 + 6 + 2×2 more CON
    expect(sheet.featIds).toContain("grappler");
    expect(sheet.featIds).toContain("fs-archery");
    expect(sheet.features.some((f) => f.id === "champion:additional-fighting-style")).toBe(true);
  });

  it("undo is just truncating the log", () => {
    const truncated = derive([srdPack], levelUpEvents.slice(0, creationEvents.length));
    expect(truncated.sheet.level).toBe(5);
    expect(truncated.sheet.abilities.str.score).toBe(19);
  });
});

describe("golden: Wood Elf lineage (subspecies)", () => {
  it("lineage stat overrides land on top of the species", () => {
    const { sheet, findings } = derive([srdPack], [
      { type: "characterCreated", name: "Sylvi", packIds: ["srd-5.2"] },
      {
        type: "abilityScoresSet",
        method: "standardArray",
        scores: { str: 10, dex: 15, con: 13, int: 12, wis: 14, cha: 8 },
      },
      { type: "decisionResolved", decisionId: "species", optionIds: ["elf"] },
      { type: "decisionResolved", decisionId: "elf:keen-senses:choice", optionIds: ["perception"] },
      { type: "decisionResolved", decisionId: "elf:lineage", optionIds: ["elf-wood"] },
    ]);
    expect(findings).toEqual([]);
    expect(sheet.subspeciesId).toBe("elf-wood");
    expect(sheet.stats["speed"]?.value).toBe(35); // Wood Elf overrides Elf's 30
    expect(sheet.stats["darkvision"]?.value).toBe(60); // inherited from Elf
  });

  it("drow lineage upgrades darkvision instead", () => {
    const { sheet } = derive([srdPack], [
      { type: "characterCreated", name: "Vex", packIds: ["srd-5.2"] },
      { type: "decisionResolved", decisionId: "species", optionIds: ["elf"] },
      { type: "decisionResolved", decisionId: "elf:lineage", optionIds: ["elf-drow"] },
    ]);
    expect(sheet.stats["darkvision"]?.value).toBe(120);
    expect(sheet.stats["speed"]?.value).toBe(30);
  });
});
