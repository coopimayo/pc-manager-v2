import type { Effect } from '../effect';

export interface ClassFeature {
  id: string;
  name: string;
  description: string;
  level: number;
  effects: Effect[];
  grantFeat?: boolean;
}
