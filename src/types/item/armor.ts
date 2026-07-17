import type { Item } from './item';

export interface Armor extends Item {
  armorClass: number;
  armorType: 'light' | 'medium' | 'heavy';
  maxDexBonus: number | null;
  strengthRequirement?: number;
  stealthDisadvantage: boolean;
}
