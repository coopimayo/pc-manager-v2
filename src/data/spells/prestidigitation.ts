import type { Spell } from '../../types/spell';

export const prestidigitation: Spell = {
  id: 'prestidigitation',
  name: 'Prestidigitation',
  level: 0,
  school: 'transmutation',
  castingTime: 'Action',
  range: '10 feet',
  duration: 'Up to 1 hour',
  concentration: false,
  description:
    'You create a magical effect within range: a harmless sensory effect, an instantaneous spark or clean/soil an object, chill or warm up to 1 cubic foot of nonliving material, a small mark or symbol, or a nonmagical trinket that lasts until the end of your next turn.',
};
