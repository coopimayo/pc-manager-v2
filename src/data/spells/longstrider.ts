import type { Spell } from '../../types/spell';

export const longstrider: Spell = {
  id: 'longstrider',
  name: 'Longstrider',
  level: 1,
  school: 'transmutation',
  castingTime: 'Action',
  range: 'Touch',
  duration: '1 hour',
  concentration: false,
  description: 'You touch a creature. The target\'s Speed increases by 10 feet until the spell ends.',
};
