import type { Feat } from '../../types';
import { archery } from './fighting-styles';
import { generalFeats } from './general';
import { originFeats } from './origin';

export { archery };
export * from './general';
export * from './origin';

export const feats: Feat[] = [archery, ...generalFeats, ...originFeats];
