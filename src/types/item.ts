import type { Ability } from './common';

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

export interface Weapon extends Item {
  damage: string;
  damageType: string;
  properties: string[];
}

export interface ArtisanTools extends Item {
  ability: Ability;
}

export interface Armor extends Item {
  armorClass: number;
  armorType: 'light' | 'medium' | 'heavy';
  stealthDisadvantage: boolean;
}
