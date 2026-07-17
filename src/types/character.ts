import type { Ability, Skill } from './common';

export interface CharacterClass {
  classId: string;
  subclassId?: string;
  level: number;
}

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
