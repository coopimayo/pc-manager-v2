import type { Background } from '../../types';
import { artisansTools, pouch, travelersClothes } from '../items';

export const artisan: Background = {
  id: 'artisan',
  name: 'Artisan',
  description:
    'You apprenticed under a master crafter, learning a trade and the value of patient, honest work.',
  abilityScores: ['str', 'dex', 'int'],
  featId: 'crafter',
  skillProficiencies: ['investigation', 'persuasion'],
  toolProficiency: "Artisan's Tools",
  startingEquipment: {
    choose: 1,
    from: [
      { label: 'A', items: [artisansTools, pouch, pouch, travelersClothes], gold: 32 },
      { label: 'B', items: [], gold: 50 },
    ],
  },
};
