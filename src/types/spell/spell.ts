import type { SpellSchool } from './spell-school';

export interface Spell {
  id: string;
  name: string;
  level: number;
  school: SpellSchool;
  castingTime: string;
  range: string;
  duration: string;
  concentration: boolean;
  description: string;
}
