import type { Effect } from '../effect';
import type { FeatCategory } from './feat-category';

export interface Feat {
  id: string;
  name: string;
  description: string;
  category: FeatCategory;
  prerequisite?: string;
  effects: Effect[];
}
