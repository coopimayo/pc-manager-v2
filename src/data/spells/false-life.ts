import type { Spell } from '../../types/spell';

export const falseLife: Spell = {
  id: 'false-life',
  name: 'False Life',
  level: 1,
  school: 'necromancy',
  castingTime: 'Action',
  range: 'Self',
  duration: 'Instantaneous',
  concentration: false,
  description:
    'Bolstering yourself with a necromantic facsimile of life, you gain 2d4 + 4 Temporary Hit Points. Using a Higher-Level Spell Slot: You gain 5 additional Temporary Hit Points for each spell slot level above 1.',
};
