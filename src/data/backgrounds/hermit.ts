import type { Background } from '../../types';
import { bedroll, bookOfPhilosophy, herbalismKit, lamp, oilFlask, quarterstaff, travelersClothes } from '../items';

export const hermit: Background = {
  id: 'hermit',
  name: 'Hermit',
  description:
    'You lived apart from society, finding clarity in solitude, study, and quiet contemplation.',
  abilityScores: ['con', 'wis', 'cha'],
  featId: 'healer',
  skillProficiencies: ['medicine', 'religion'],
  toolProficiency: 'Herbalism Kit',
  startingEquipment: {
    choose: 1,
    from: [
      {
        label: 'A',
        items: [bedroll, bookOfPhilosophy, herbalismKit, lamp, oilFlask, oilFlask, oilFlask, quarterstaff, travelersClothes],
        gold: 16,
      },
      { label: 'B', items: [], gold: 50 },
    ],
  },
};
