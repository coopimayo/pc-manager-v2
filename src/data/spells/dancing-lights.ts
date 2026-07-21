import type { Spell } from '../../types/spell';

export const dancingLights: Spell = {
  id: 'dancing-lights',
  name: 'Dancing Lights',
  level: 0,
  school: 'illusion',
  castingTime: 'Action',
  range: '120 feet',
  duration: 'Concentration, up to 1 minute',
  concentration: true,
  description:
    'You create up to four torch-sized lights within range, making them appear as torches, lanterns, or glowing orbs that hover for the duration. You can also combine the four lights into one glowing Medium humanoid form. As a Bonus Action, you can move the lights up to 60 feet to a new spot within range.',
};
