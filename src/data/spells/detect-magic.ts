import type { Spell } from '../../types/spell';

export const detectMagic: Spell = {
  id: 'detect-magic',
  name: 'Detect Magic',
  level: 1,
  school: 'divination',
  castingTime: 'Action',
  range: 'Self',
  duration: 'Concentration, up to 10 minutes',
  concentration: true,
  description:
    'For the duration, you sense the presence of magical effects within 30 feet of yourself. If you sense such effects, you can take the Magic action to see a faint aura around any visible creature or object that bears the magic, and you learn its school of magic, if any.',
};
