import type { Effect } from '../effect';
import type { Feat } from '../feat';

export interface ClassFeature {
  id: string;
  name: string;
  description: string;
  level: number;
  effects: Effect[];
  grantFeat?: Feat['category'];
}
