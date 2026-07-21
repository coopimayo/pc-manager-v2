import type { Spell } from '../../types/spell';

export const mistyStep: Spell = {
  id: 'misty-step',
  name: 'Misty Step',
  level: 2,
  school: 'conjuration',
  castingTime: 'Bonus Action',
  range: 'Self',
  duration: 'Instantaneous',
  concentration: false,
  description:
    'Briefly surrounded by silvery mist, you teleport up to 30 feet to an unoccupied space that you can see.',
};
