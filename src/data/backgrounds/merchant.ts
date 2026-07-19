import type { Background } from '../../types';
import { navigatorsTools, pouch, travelersClothes } from '../items';

export const merchant: Background = {
  id: 'merchant',
  name: 'Merchant',
  description:
    'You apprenticed with a trader, learning to appraise goods, haggle over prices, and move cargo along dangerous routes.',
  abilityScores: ['con', 'int', 'cha'],
  featId: 'lucky',
  skillProficiencies: ['animal-handling', 'persuasion'],
  toolProficiency: "Navigator's Tools",
  startingEquipment: {
    choose: 1,
    from: [
      { label: 'A', items: [navigatorsTools, pouch, pouch, travelersClothes], gold: 22 },
      { label: 'B', items: [], gold: 50 },
    ],
  },
};
