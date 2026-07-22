import type { Spell } from '../../types/spell';

export const minorIllusion: Spell = {
  id: 'minor-illusion',
  name: 'Minor Illusion',
  level: 0,
  school: 'illusion',
  castingTime: 'Action',
  range: '30 feet',
  duration: '1 minute',
  concentration: false,
  description:
    'You create a sound or an image of an object within range that lasts for the duration. The illusion ends if you dismiss it (no action required) or cast this spell again. A sound can range from a whisper to a scream. An image must be no larger than a 5-foot Cube and can\'t create sound, light, smell, or other sensory effects. Physical interaction reveals a visual illusion to be false, and a creature that takes the Study action to examine the sound or image can determine it is an illusion with a successful Intelligence (Investigation) check against your spell save DC.',
};
