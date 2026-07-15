/**
 * Every content pack in the repo must pass these checks in CI:
 * schema validity plus referential integrity of every cross-entity reference.
 */
import { describe, expect, it } from "vitest";
import { contentPackSchema, SKILLS, type Effect, type Entity } from "@pc-manager/engine";
import { srdPack } from "../src/index.js";

function allEffects(entity: Entity): Effect[] {
  switch (entity.type) {
    case "species":
    case "subspecies":
    case "feat":
    case "background":
      return entity.effects;
    case "class":
    case "subclass":
      return Object.values(entity.levels).flatMap((lvl) => lvl?.effects ?? []);
  }
}

/** Depth-first walk through nested features, decisions, and list options. */
function walkEffects(effects: Effect[], visit: (e: Effect) => void): void {
  for (const effect of effects) {
    visit(effect);
    if (effect.kind === "grantFeature") {
      walkEffects(effect.feature.effects ?? [], visit);
    }
    if (effect.kind === "grantDecision" && effect.decision.options.source === "list") {
      for (const option of effect.decision.options.options) {
        walkEffects(option.effects, visit);
      }
    }
  }
}

const ids = new Set(srdPack.entities.map((e) => e.id));
const byType = (type: Entity["type"]) =>
  new Set(srdPack.entities.filter((e) => e.type === type).map((e) => e.id));

describe("srd pack validity", () => {
  it("validates against the content pack schema", () => {
    const result = contentPackSchema.safeParse(srdPack);
    if (!result.success) {
      throw new Error(result.error.message);
    }
    expect(result.success).toBe(true);
  });

  it("has unique entity ids", () => {
    expect(ids.size).toBe(srdPack.entities.length);
  });

  it("carries the CC-BY attribution", () => {
    expect(srdPack.license.name).toBe("CC-BY-4.0");
    expect(srdPack.license.attribution).toContain("System Reference Document 5.2");
  });

  it("subspecies reference existing species; subclasses reference existing classes", () => {
    const speciesIds = byType("species");
    const classIds = byType("class");
    for (const entity of srdPack.entities) {
      if (entity.type === "subspecies") expect(speciesIds).toContain(entity.speciesId);
      if (entity.type === "subclass") expect(classIds).toContain(entity.classId);
    }
  });

  it("every cross-reference inside effects resolves", () => {
    const featIds = byType("feat");
    const speciesIds = byType("species");
    const classIds = byType("class");
    const problems: string[] = [];

    for (const entity of srdPack.entities) {
      walkEffects(allEffects(entity), (effect) => {
        if (effect.kind === "grantFeat" && !featIds.has(effect.featId)) {
          problems.push(`${entity.id}: grantFeat → missing feat "${effect.featId}"`);
        }
        if (effect.kind === "grantProficiency" && effect.proficiency.type === "skill") {
          if (!(effect.proficiency.id in SKILLS)) {
            problems.push(`${entity.id}: unknown skill "${effect.proficiency.id}"`);
          }
        }
        if (effect.kind === "grantDecision" && effect.decision.options.source === "query") {
          const filter = effect.decision.options.filter;
          if (filter?.speciesId && !speciesIds.has(filter.speciesId)) {
            problems.push(`${entity.id}: decision filters on missing species "${filter.speciesId}"`);
          }
          if (filter?.classId && !classIds.has(filter.classId)) {
            problems.push(`${entity.id}: decision filters on missing class "${filter.classId}"`);
          }
        }
      });
    }
    expect(problems).toEqual([]);
  });

  it("fighter declares all 20 levels", () => {
    const fighter = srdPack.entities.find((e) => e.id === "fighter");
    expect(fighter?.type).toBe("class");
    if (fighter?.type !== "class") return;
    for (let lvl = 1; lvl <= 20; lvl++) {
      expect(fighter.levels[lvl], `fighter level ${lvl}`).toBeDefined();
    }
  });
});
