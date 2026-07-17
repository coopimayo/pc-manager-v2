import type { Activation, Uses } from '../effect';

export interface SheetAbility {
  name: string;
  description: string;
  activation: Activation;
  uses?: Uses;
}
