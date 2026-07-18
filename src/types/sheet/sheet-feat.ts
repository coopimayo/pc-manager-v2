import type { Feat } from '../feat';

export interface SheetFeat {
  name: string;
  description: string;
  category: Feat['category'];
  note?: string;
}
