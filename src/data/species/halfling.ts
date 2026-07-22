import type { Species } from '../../types/species';

export const halfling: Species = {
  id: 'halfling',
  name: 'Halfling',
  description:
    'Halflings are a small, cheerful folk who value the comforts of home yet carry a surprising well of courage and luck. They slip through the world nimble and unnoticed, meeting misfortune with an easy smile and an uncanny knack for landing on their feet.',
  creatureType: 'humanoid',
  size: 'small',
  speed: 30,
  traits: [
    {
      id: 'halfling-brave',
      name: 'Brave',
      description:
        'You have Advantage on saving throws you make to avoid or end the Frightened condition.',
      effects: [],
    },
    {
      id: 'halfling-halfling-nimbleness',
      name: 'Halfling Nimbleness',
      description:
        'You can move through the space of any creature that is a size larger than you, but you can\'t stop in the same space.',
      effects: [],
    },
    {
      id: 'halfling-luck',
      name: 'Luck',
      description:
        'When you roll a 1 on the d20 of a D20 Test, you can reroll the die, and you must use the new roll.',
      effects: [],
    },
    {
      id: 'halfling-naturally-stealthy',
      name: 'Naturally Stealthy',
      description:
        'You can take the Hide action even when you are obscured only by a creature that is at least one size larger than you.',
      effects: [],
    },
  ],
};
