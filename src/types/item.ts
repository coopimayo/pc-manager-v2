import type { Ability, Die, DamageType } from './common';

export type CoinUnit = 'cp' | 'sp' | 'ep' | 'gp' | 'pp';

export interface Cost {
  amount: number;
  unit: CoinUnit;
}

export interface Item {
  id: string;
  name: string;
  cost: Cost;
  weight: number;
}

export interface EquipmentOption {
  label: string;
  items: Item[];
  gold: number;
}

export interface Damage {
  count: number;
  die: Die;
  type: DamageType;
}

export type WeaponCategory = 'simple' | 'martial';

export type WeaponProperty =
  | 'ammunition'
  | 'finesse'
  | 'heavy'
  | 'light'
  | 'loading'
  | 'range'
  | 'reach'
  | 'thrown'
  | 'two-handed'
  | 'versatile';

export type WeaponMastery =
  | 'cleave'
  | 'graze'
  | 'nick'
  | 'push'
  | 'sap'
  | 'slow'
  | 'topple'
  | 'vex';

export interface Weapon extends Item {
  category: WeaponCategory;
  attackType: 'melee' | 'ranged';
  damage: Damage;
  properties: WeaponProperty[];
  mastery: WeaponMastery;
  /** Normal / long range in feet, for ranged and thrown weapons. */
  range?: { normal: number; long: number };
}

export interface ArtisanTools extends Item {
  ability: Ability;
}

export interface Armor extends Item {
  /** Base AC before the Dex modifier is added. */
  armorClass: number;
  armorType: 'light' | 'medium' | 'heavy';
  /** Cap on the Dex modifier added to AC: null = no cap (light), 2 = medium, 0 = heavy. */
  maxDexBonus: number | null;
  /** Minimum Strength to wear without a speed penalty (heavy armor). */
  strengthRequirement?: number;
  stealthDisadvantage: boolean;
}
