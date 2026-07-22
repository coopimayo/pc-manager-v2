import type { Subspecies } from '../../../types/species';
import { forestGnome } from './forest-gnome';
import { rockGnome } from './rock-gnome';

export { gnome } from './gnome';
export { forestGnome, rockGnome };

export const gnomeSubspecies: Subspecies[] = [forestGnome, rockGnome];
