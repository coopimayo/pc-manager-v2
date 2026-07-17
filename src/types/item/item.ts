import type { Cost } from './cost';

export interface Item {
  id: string;
  name: string;
  cost: Cost;
  weight: number;
}
