import type { Ability, Predicate, ProficiencyRef } from "./types.js";

/** The slice of character state predicates are checked against. */
export interface PredicateContext {
  abilityScores: Record<Ability, number>;
  hasProficiency: (ref: ProficiencyRef) => boolean;
  classLevel: (classId: string) => number;
  characterLevel: number;
}

export function evaluatePredicate(p: Predicate, ctx: PredicateContext): boolean {
  switch (p.type) {
    case "abilityAtLeast":
      return ctx.abilityScores[p.ability] >= p.value;
    case "hasProficiency":
      return ctx.hasProficiency(p.proficiency);
    case "classLevelAtLeast":
      return ctx.classLevel(p.classId) >= p.level;
    case "characterLevelAtLeast":
      return ctx.characterLevel >= p.level;
    case "all":
      return p.predicates.every((sub) => evaluatePredicate(sub, ctx));
    case "any":
      return p.predicates.some((sub) => evaluatePredicate(sub, ctx));
  }
}

/** Human-readable description for UI "why is this greyed out" text. */
export function describePredicate(p: Predicate): string {
  switch (p.type) {
    case "abilityAtLeast":
      return `${p.ability.toUpperCase()} ${p.value}+`;
    case "hasProficiency":
      return `proficiency: ${p.proficiency.id}`;
    case "classLevelAtLeast":
      return `${p.classId} level ${p.level}+`;
    case "characterLevelAtLeast":
      return `character level ${p.level}+`;
    case "all":
      return p.predicates.map(describePredicate).join(" and ");
    case "any":
      return p.predicates.map(describePredicate).join(" or ");
  }
}
