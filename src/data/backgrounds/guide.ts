import type { Background } from '../../types';
import { bedroll, cartographersTools, fishingTackle, quarterstaff, tent, travelersClothes } from '../items';

export const guide: Background = {
  id: 'guide',
  name: 'Guide',
  description:
    'You came of age in the wilds, leading travelers safely through untamed country.',
  abilityScores: ['dex', 'con', 'wis'],
  featId: 'magic-initiate-druid',
  skillProficiencies: ['stealth', 'survival'],
  toolProficiency: "Cartographer's Tools",
  startingEquipment: {
    choose: 1,
    from: [
      {
        label: 'A',
        items: [bedroll, cartographersTools, fishingTackle, quarterstaff, tent, travelersClothes],
        gold: 3,
      },
      { label: 'B', items: [], gold: 50 },
    ],
  },
};
