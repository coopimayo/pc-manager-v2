import type { Ability } from '../common';
import type { Item } from './item';

export interface ArtisanTools extends Item {
  ability: Ability;
}
