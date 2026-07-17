import type { Ability, Skill } from '../common';
import type { CharacterClass } from './character-class';

export interface Character {
  id: string;
  name: string;
  speciesId: string;
  subspeciesId?: string;
  backgroundId: string;
  classes: CharacterClass[];
  abilityScores: Record<Ability, number>;
  skillProficiencies: Skill[];
  featIds: string[];
}
