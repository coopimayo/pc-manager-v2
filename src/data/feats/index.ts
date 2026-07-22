import type { Feat } from '../../types';
import { fightingStyleFeats } from './fighting-styles';
import { generalFeats } from './general';
import { originFeats } from './origin';

export * from './fighting-styles';
export * from './general';
export * from './origin';

export const feats: Feat[] = [...fightingStyleFeats, ...generalFeats, ...originFeats];
