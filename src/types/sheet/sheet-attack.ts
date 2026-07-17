import type { DamageType, Die } from '../common';

export interface SheetAttack {
  name: string;
  attackBonus: number;
  damage: {
    count: number;
    die: Die;
    modifier: number;
    type: DamageType;
  };
}
