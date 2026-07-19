import type { Background } from '../../types';
import { crowbar, dagger, pouch, thievesTools, travelersClothes } from '../items';

export const criminal: Background = {
  id: 'criminal',
  name: 'Criminal',
  description:
    'You made your living in the shadows, picking locks and pockets among a network of thieves and fences.',
  abilityScores: ['dex', 'con', 'int'],
  featId: 'alert',
  skillProficiencies: ['sleight-of-hand', 'stealth'],
  toolProficiency: "Thieves' Tools",
  startingEquipment: {
    choose: 1,
    from: [
      {
        label: 'A',
        items: [dagger, dagger, thievesTools, crowbar, pouch, pouch, travelersClothes],
        gold: 16,
      },
      { label: 'B', items: [], gold: 50 },
    ],
  },
};
