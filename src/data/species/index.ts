import type { Species, Subspecies } from '../../types/species';
import { aasimar } from './aasimar';
import { human } from './human';
import { dwarf } from './dwarf';
import { elf, elfSubspecies } from './elf';
import { gnome, gnomeSubspecies } from './gnome';
import { dragonborn, dragonbornSubspecies } from './dragonborn';
import { goliath, goliathSubspecies } from './goliath';

export { aasimar, human, dwarf, elf, gnome, dragonborn, goliath };

export const species: Species[] = [aasimar, human, dwarf, elf, gnome, dragonborn, goliath];
export const subspecies: Subspecies[] = [
  ...elfSubspecies,
  ...gnomeSubspecies,
  ...dragonbornSubspecies,
  ...goliathSubspecies,
];
