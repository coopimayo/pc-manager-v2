import type { Background } from '../../types';
import { dagger, navigatorsTools, rope, travelersClothes } from '../items';

export const sailor: Background = {
  id: 'sailor',
  name: 'Sailor',
  description:
    'You lived the life of a seafarer, riding out storms, working the rigging, and brawling in dockside taverns.',
  abilityScores: ['str', 'dex', 'wis'],
  featId: 'tavern-brawler',
  skillProficiencies: ['acrobatics', 'perception'],
  toolProficiency: "Navigator's Tools",
  startingEquipment: {
    choose: 1,
    from: [
      { label: 'A', items: [dagger, navigatorsTools, rope, travelersClothes], gold: 20 },
      { label: 'B', items: [], gold: 50 },
    ],
  },
};
