import type { Trait } from './trait';

export interface Subspecies {
  id: string;
  speciesId: string;
  name: string;
  traits: Trait[];
}
