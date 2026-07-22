import type { Species, Subspecies } from '../../types/species';
import { aasimar } from './aasimar';
import { human } from './human';
import { dwarf } from './dwarf';
import { elf, elfSubspecies } from './elf';
import { gnome, gnomeSubspecies } from './gnome';
import { dragonborn, dragonbornSubspecies } from './dragonborn';
import { goliath, goliathSubspecies } from './goliath';
import { halfling } from './halfling';
import { orc } from './orc';
import { tiefling, tieflingSubspecies } from './tiefling';

export { aasimar, human, dwarf, elf, gnome, dragonborn, goliath, halfling, orc, tiefling };

export const species: Species[] = [aasimar, human, dwarf, elf, gnome, dragonborn, goliath, halfling, orc, tiefling];
export const subspecies: Subspecies[] = [
  ...elfSubspecies,
  ...gnomeSubspecies,
  ...dragonbornSubspecies,
  ...goliathSubspecies,
  ...tieflingSubspecies,
];
