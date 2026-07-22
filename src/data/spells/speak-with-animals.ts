import type { Spell } from '../../types/spell';

export const speakWithAnimals: Spell = {
  id: 'speak-with-animals',
  name: 'Speak with Animals',
  level: 1,
  school: 'divination',
  castingTime: 'Action',
  range: 'Self',
  duration: '10 minutes',
  concentration: false,
  description:
    'For the duration, you can comprehend and verbally communicate with Beasts, and you can use any of the Influence action\'s skills with them. Most Beasts have little to say, but at your GM\'s discretion, a Beast might convey information about nearby locations and monsters, including whatever it can perceive or has perceived within the past day.',
};
