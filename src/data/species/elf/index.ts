import type { Subspecies } from '../../../types/species';
import { drow } from './drow';
import { highElf } from './high-elf';
import { woodElf } from './wood-elf';

export { elf } from './elf';
export { drow, highElf, woodElf };

export const elfSubspecies: Subspecies[] = [drow, highElf, woodElf];
