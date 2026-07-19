import type { Background } from '../../types';
import { fineClothes, gamingSet, perfume } from '../items';

export const noble: Background = {
  id: 'noble',
  name: 'Noble',
  description:
    'You were raised in a castle among wealth and privilege, trained in etiquette, politics, and the games of court.',
  abilityScores: ['str', 'int', 'cha'],
  featId: 'skilled',
  skillProficiencies: ['history', 'persuasion'],
  toolProficiency: 'Gaming Set',
  startingEquipment: {
    choose: 1,
    from: [
      { label: 'A', items: [fineClothes, gamingSet, perfume], gold: 29 },
      { label: 'B', items: [], gold: 50 },
    ],
  },
};
