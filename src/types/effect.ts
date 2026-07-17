import type { Ability, Skill } from './common';

/**
 * A single machine-readable effect granted by a feat (and, later, traits and
 * class features). Effects compose: an entity carries a list of them.
 * Widen this union as new kinds of effect are needed.
 */
export type Effect =
  | { kind: 'abilityScoreIncrease'; ability: Ability; amount: number }
  | { kind: 'grantSpells'; spellIds: string[]; castingAbility: Ability }
  | { kind: 'grantReaction'; name: string; description: string; trigger: string }
  | { kind: 'grantProficiency'; skill: Skill };
