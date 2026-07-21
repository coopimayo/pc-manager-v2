import type { Ability } from '../common';

export type SpellcastingProgression = 'full' | 'half' | 'third';

export interface ClassSpellcasting {
  ability: Ability;
  progression: SpellcastingProgression;
}
