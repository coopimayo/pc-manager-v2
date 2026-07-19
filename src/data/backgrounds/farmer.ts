import type { Background } from '../../types';
import { carpentersTools, healersKit, ironPot, shovel, sickle } from '../items';

export const farmer: Background = {
  id: 'farmer',
  name: 'Farmer',
  description:
    'You grew up working the land, learning the value of hard labor, patience, and a well-kept toolshed.',
  abilityScores: ['str', 'con', 'wis'],
  featId: 'tough',
  skillProficiencies: ['animal-handling', 'nature'],
  toolProficiency: "Carpenter's Tools",
  startingEquipment: {
    choose: 1,
    from: [
      { label: 'A', items: [sickle, carpentersTools, healersKit, ironPot, shovel], gold: 30 },
      { label: 'B', items: [], gold: 50 },
    ],
  },
};
