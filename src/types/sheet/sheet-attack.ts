import type { DamageType, Die } from '../common';

export type SheetDamage =
  | { count: number; die: Die; modifier: number; type: DamageType }
  | { flat: number; modifier: number; type: DamageType };

export interface SheetAttack {
  name: string;
  attackBonus: number;
  damage: SheetDamage;
}
