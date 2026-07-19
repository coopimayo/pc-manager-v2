import type { Background } from '../../types';
import {
  bolts,
  gamingSet,
  hoodedLantern,
  lightCrossbow,
  manacles,
  quiver,
  spear,
  travelersClothes,
} from '../items';

export const guard: Background = {
  id: 'guard',
  name: 'Guard',
  description:
    'You stood long watches on city walls and gates, keeping a sharp eye out for trouble.',
  abilityScores: ['str', 'int', 'wis'],
  featId: 'alert',
  skillProficiencies: ['athletics', 'perception'],
  toolProficiency: 'Gaming Set',
  startingEquipment: {
    choose: 1,
    from: [
      {
        label: 'A',
        items: [spear, lightCrossbow, bolts, gamingSet, hoodedLantern, manacles, quiver, travelersClothes],
        gold: 12,
      },
      { label: 'B', items: [], gold: 50 },
    ],
  },
};
