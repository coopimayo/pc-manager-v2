import type { Spell } from '../../types/spell';

export const rayOfEnfeeblement: Spell = {
  id: 'ray-of-enfeeblement',
  name: 'Ray of Enfeeblement',
  level: 2,
  school: 'necromancy',
  castingTime: 'Action',
  range: '60 feet',
  duration: 'Concentration, up to 1 minute',
  concentration: true,
  description:
    'A black beam of enervating energy springs from your finger toward a creature within range. Make a ranged spell attack against the target. On a hit, the target deals only half damage with weapon attacks that use Strength until the spell ends. At the end of each of the target\'s turns, it can make a Constitution saving throw against this spell, ending the spell on itself on a success.',
};
