import type { Species, Subspecies } from '../../types/species';
import { aasimar } from './aasimar';
import { human } from './human';
import { dwarf } from './dwarf';
import { elf, elfSubspecies } from './elf';
import { dragonborn, dragonbornSubspecies } from './dragonborn';

export { aasimar, human, dwarf, elf, dragonborn };

export const species: Species[] = [aasimar, human, dwarf, elf, dragonborn];
export const subspecies: Subspecies[] = [...elfSubspecies, ...dragonbornSubspecies];
