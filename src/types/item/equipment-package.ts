import type { Item } from './item';

export interface EquipmentPackage {
  label: string;
  items: Item[];
  gold: number;
}
