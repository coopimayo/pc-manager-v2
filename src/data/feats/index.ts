import type { Feat } from '../../types';
import { archery } from './fighting-styles';
import { generalFeats } from './general';

export { archery };
export * from './general';

export const feats: Feat[] = [archery, ...generalFeats];
