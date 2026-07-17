import type { Effect } from './effect';

export interface Feat {
  id: string;
  name: string;
  description: string;
  category: 'origin' | 'general' | 'fighting-style' | 'epic-boon';
  prerequisite?: string;
  effects: Effect[];
}
