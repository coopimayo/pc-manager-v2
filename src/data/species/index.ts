import type { Species, Subspecies } from '../../types/species';
import { aasimar } from './aasimar';
import { human } from './human';
import { elf, elfSubspecies } from './elf';

export { aasimar, human, elf };

export const species: Species[] = [aasimar, human, elf];
export const subspecies: Subspecies[] = [...elfSubspecies];
