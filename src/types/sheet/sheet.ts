import type { Ability } from '../common';
import type { SheetAbility } from './sheet-ability';
import type { SheetAttack } from './sheet-attack';
import type { SheetClass } from './sheet-class';
import type { SheetFeat } from './sheet-feat';
import type { SheetFeature } from './sheet-feature';
import type { SheetSkill } from './sheet-skill';
import type { SheetTrait } from './sheet-trait';

export interface Sheet {
  name: string;
  species?: string;
  background?: string;
  classes: SheetClass[];
  level: number;
  proficiencyBonus: number;
  initiative: number;
  abilityScores: Record<Ability, number>;
  abilityModifiers: Record<Ability, number>;
  hitPoints: number;
  skills: SheetSkill[];
  features: SheetFeature[];
  traits: SheetTrait[];
  feats: SheetFeat[];
  abilities: SheetAbility[];
  attacks: SheetAttack[];
}
