import type { Spell } from '../../types/spell';

export const darkness: Spell = {
  id: 'darkness',
  name: 'Darkness',
  level: 2,
  school: 'evocation',
  castingTime: 'Action',
  range: '60 feet',
  duration: 'Concentration, up to 10 minutes',
  concentration: true,
  description:
    'Magical Darkness spreads from a point within range to fill a 15-foot-radius Sphere for the duration. Darkvision can\'t see through it, and nonmagical light can\'t illuminate it.',
};
