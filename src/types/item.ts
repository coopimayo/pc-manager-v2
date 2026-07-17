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

export interface EquipmentPackage {
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
  range?: { normal: number; long: number };
}

export interface ArtisanTools extends Item {
  ability: Ability;
}

export interface Armor extends Item {
  armorClass: number;
  armorType: 'light' | 'medium' | 'heavy';
  maxDexBonus: number | null;
  strengthRequirement?: number;
  stealthDisadvantage: boolean;
}
