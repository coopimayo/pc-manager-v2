import type { Spell } from '../../types/spell';

export const fireBolt: Spell = {
  id: 'fire-bolt',
  name: 'Fire Bolt',
  level: 0,
  school: 'evocation',
  castingTime: 'Action',
  range: '120 feet',
  duration: 'Instantaneous',
  concentration: false,
  description:
    'You hurl a mote of fire at a creature or an object within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 Fire damage. A flammable object hit by this spell starts burning if it isn\'t being worn or carried. This spell\'s damage increases by 1d10 when you reach levels 5 (2d10), 11 (3d10), and 17 (4d10).',
};
