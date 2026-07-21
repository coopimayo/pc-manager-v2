import type { Species } from '../../types/species';

export const human: Species = {
  id: 'human',
  name: 'Human',
  description:
    'Found throughout the multiverse, humans are as varied as they are numerous. They live with urgency, striving to achieve as much as they can in their comparatively short lives.',
  creatureType: 'humanoid',
  size: 'medium',
  speed: 30,
  traits: [
    {
      id: 'human-resourceful',
      name: 'Resourceful',
      description: 'You gain Heroic Inspiration whenever you finish a Long Rest.',
      effects: [],
    },
    {
      id: 'human-skillful',
      name: 'Skillful',
      description: 'You gain proficiency in one skill of your choice.',
      effects: [{ kind: 'skillProficiencyChoice', count: 1 }],
    },
    {
      id: 'human-versatile',
      name: 'Versatile',
      description: 'You gain an Origin feat of your choice.',
      effects: [{ kind: 'grantFeat', category: 'origin' }],
    },
  ],
};
