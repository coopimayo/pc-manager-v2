import type { Ability, Skill } from '../common';

export interface SheetSkill {
  skill: Skill;
  ability: Ability;
  modifier: number;
  proficient: boolean;
}
