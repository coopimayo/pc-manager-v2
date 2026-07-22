import type { Species, Subspecies } from '../../types/species';
import { aasimar } from './aasimar';
import { human } from './human';
import { elf, elfSubspecies } from './elf';
import { dragonborn, dragonbornSubspecies } from './dragonborn';

export { aasimar, human, elf, dragonborn };

export const species: Species[] = [aasimar, human, elf, dragonborn];
export const subspecies: Subspecies[] = [...elfSubspecies, ...dragonbornSubspecies];
