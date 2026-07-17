import type { AttackType } from './attack-type';
import type { Damage } from './damage';
import type { Item } from './item';
import type { WeaponCategory } from './weapon-category';
import type { WeaponMastery } from './weapon-mastery';
import type { WeaponProperty } from './weapon-property';

export interface Weapon extends Item {
  category: WeaponCategory;
  attackType: AttackType;
  damage: Damage;
  properties: WeaponProperty[];
  mastery: WeaponMastery;
  range?: { normal: number; long: number };
}
