import type { Activation, RechargeRule } from '../effect';

export interface SheetAbility {
  name: string;
  description: string;
  activation: Activation;
  uses?: { count: number; recharge: RechargeRule[] };
}
