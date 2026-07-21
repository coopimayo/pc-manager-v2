import type { Species, Subspecies } from '../../types/species';
import { human } from './human';
import { elf, elfSubspecies } from './elf';

export { human, elf };

export const species: Species[] = [human, elf];
export const subspecies: Subspecies[] = [...elfSubspecies];
