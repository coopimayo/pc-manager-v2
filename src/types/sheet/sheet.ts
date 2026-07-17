import type { ClassFeature } from '../class';
import type { Ability } from '../common';
import type { SheetAbility } from './sheet-ability';
import type { SheetAttack } from './sheet-attack';
import type { SheetClass } from './sheet-class';
import type { SheetSkill } from './sheet-skill';

export interface Sheet {
  name: string;
  classes: SheetClass[];
  level: number;
  proficiencyBonus: number;
  abilityScores: Record<Ability, number>;
  abilityModifiers: Record<Ability, number>;
  hitPoints: number;
  skills: SheetSkill[];
  features: ClassFeature[];
  abilities: SheetAbility[];
  attacks: SheetAttack[];
}
