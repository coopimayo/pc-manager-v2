import type { Spell } from '../../types/spell';

export const holdPerson: Spell = {
  id: 'hold-person',
  name: 'Hold Person',
  level: 2,
  school: 'enchantment',
  castingTime: 'Action',
  range: '60 feet',
  duration: 'Concentration, up to 1 minute',
  concentration: true,
  description:
    'Choose a Humanoid that you can see within range. The target must succeed on a Wisdom saving throw or have the Paralyzed condition for the duration. At the end of each of its turns, the target repeats the save, ending the spell on itself on a success. Using a Higher-Level Spell Slot: You can target one additional Humanoid for each spell slot level above 2.',
};
