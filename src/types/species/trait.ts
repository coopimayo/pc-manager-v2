import type { Effect } from '../effect';

export interface Trait {
  id: string;
  name: string;
  description: string;
  effects: Effect[];
}
