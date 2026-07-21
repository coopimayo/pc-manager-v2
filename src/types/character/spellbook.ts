import type { Ability } from '../common';

export interface Spellbook {
  castingAbility?: Ability;
  knownSpellIds: string[];
}
