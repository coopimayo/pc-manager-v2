import type { Spell } from '../../types/spell';

export const passWithoutTrace: Spell = {
  id: 'pass-without-trace',
  name: 'Pass without Trace',
  level: 2,
  school: 'abjuration',
  castingTime: 'Action',
  range: 'Self',
  duration: 'Concentration, up to 1 hour',
  concentration: true,
  description:
    'A veil of shadows and silence radiates from you, masking you and your companions from detection. For the duration, each creature you choose within 30 feet of you has a +10 bonus to Dexterity (Stealth) checks and can\'t be tracked except by magical means.',
};
