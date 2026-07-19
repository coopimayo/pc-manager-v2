import type { Background } from '../../types';
import { bedroll, dagger, gamingSet, pouch, thievesTools, travelersClothes } from '../items';

export const wayfarer: Background = {
  id: 'wayfarer',
  name: 'Wayfarer',
  description:
    'You grew up on the streets with little to your name, surviving on luck, wits, and the occasional lifted purse.',
  abilityScores: ['dex', 'wis', 'cha'],
  featId: 'lucky',
  skillProficiencies: ['insight', 'stealth'],
  toolProficiency: "Thieves' Tools",
  startingEquipment: {
    choose: 1,
    from: [
      {
        label: 'A',
        items: [dagger, dagger, thievesTools, gamingSet, bedroll, pouch, pouch, travelersClothes],
        gold: 16,
      },
      { label: 'B', items: [], gold: 50 },
    ],
  },
};
