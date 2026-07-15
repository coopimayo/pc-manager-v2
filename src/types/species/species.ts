import type { Size } from '../common';
import type { Trait } from './trait';

export interface Species {
  id: string;
  name: string;
  description: string;
  creatureType: 'abberation' | 'beast' | 'celestial' | 'construct' | 'dragon' | 'elemental' | 'fey' | 'fiend' | 'giant' | 'humanoid' | 'monstrosity' | 'ooze' | 'plant' | 'undead';
  size: Size;
  speed: number;
  traits: Trait[];
}
