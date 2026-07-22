import type { Spell } from '../../types/spell';

export const rayOfSickness: Spell = {
  id: 'ray-of-sickness',
  name: 'Ray of Sickness',
  level: 1,
  school: 'necromancy',
  castingTime: 'Action',
  range: '60 feet',
  duration: 'Instantaneous',
  concentration: false,
  description:
    'A ray of sickening greenish energy lashes out toward a creature within range. Make a ranged spell attack against the target. On a hit, the target takes 2d8 Poison damage and has the Poisoned condition until the end of your next turn. Using a Higher-Level Spell Slot: The damage increases by 1d8 for each spell slot level above 1.',
};
