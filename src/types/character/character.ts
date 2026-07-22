import type { Ability, Skill } from '../common';
import type { Tool } from '../item';
import type { CharacterClass } from './character-class';
import type { Spellbook } from './spellbook';

export interface Character {
  id: string;
  name: string;
  speciesId: string;
  subspeciesId?: string;
  backgroundId: string;
  classes: CharacterClass[];
  abilityScores: Record<Ability, number>;
  abilityScoreIncreases?: Partial<Record<Ability, number>>;
  skillProficiencies: Skill[];
  toolProficiencies?: Tool['name'][];
  featIds: string[];
  weaponIds: string[];
  spellbook: Spellbook;
  hiddenFeatureIds?: string[];
  hiddenTraitIds?: string[];
}
