import type { Ability } from '../common';
import type { Item } from './item';

export interface Tool extends Item {
  ability: Ability;
  category: 'artisan' | 'other';
}
