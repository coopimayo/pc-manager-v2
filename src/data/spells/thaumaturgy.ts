import type { Spell } from '../../types/spell';

export const thaumaturgy: Spell = {
  id: 'thaumaturgy',
  name: 'Thaumaturgy',
  level: 0,
  school: 'transmutation',
  castingTime: 'Action',
  range: '30 feet',
  duration: 'Up to 1 minute',
  concentration: false,
  description:
    'You manifest a minor wonder within range. You create one of the following magical effects: your voice booms up to three times as loud as normal for 1 minute; you cause flames to flicker, brighten, dim, or change color for 1 minute; you cause harmless tremors in the ground for 1 minute; you create an instantaneous sound that originates from a point of your choice, such as a rumble of thunder, the cry of a raven, or ominous whispers; you instantaneously cause an unlocked door or window to fly open or slam shut; or you alter the appearance of your eyes for 1 minute. If you cast this spell multiple times, you can have up to three of its 1-minute effects active at a time, and you can dismiss such an effect as an Action.',
};
