import type { LevelScaled } from '../common';
import type { RechargeRule } from './recharge-rule';

export interface Uses {
  count: number | LevelScaled | 'proficiencyBonus';
  recharge: RechargeRule[];
}
