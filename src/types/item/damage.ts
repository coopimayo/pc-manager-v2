import type { DamageType, Die } from '../common';

export interface Damage {
  count: number;
  die: Die;
  type: DamageType;
}
