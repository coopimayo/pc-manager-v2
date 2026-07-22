import type { Spell } from '../../types/spell';

export const hellishRebuke: Spell = {
  id: 'hellish-rebuke',
  name: 'Hellish Rebuke',
  level: 1,
  school: 'evocation',
  castingTime: 'Reaction',
  range: '60 feet',
  duration: 'Instantaneous',
  concentration: false,
  description:
    'Taken in response to taking damage from a creature within 60 feet that you can see, you point your finger, and the creature that damaged you is momentarily surrounded by Hellish flames. The creature makes a Dexterity saving throw, taking 2d10 Fire damage on a failed save or half as much damage on a successful one. Using a Higher-Level Spell Slot: The damage increases by 1d10 for each spell slot level above 1.',
};
