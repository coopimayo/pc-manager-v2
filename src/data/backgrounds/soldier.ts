import type { Background } from '../../types';
import {
  arrows,
  gamingSet,
  healersKit,
  quiver,
  shortbow,
  spear,
  travelersClothes,
} from '../items';

export const soldier: Background = {
  id: 'soldier',
  name: 'Soldier',
  description:
    'You trained for war from a young age, learning the use of weapons and armor in an army, a militia, or a mercenary company.',
  abilityScores: ['str', 'dex', 'con'],
  featId: 'savage-attacker',
  skillProficiencies: ['athletics', 'intimidation'],
  toolProficiency: 'Gaming Set',
  startingEquipment: {
    choose: 1,
    from: [
      {
        label: 'A',
        items: [spear, shortbow, arrows, gamingSet, healersKit, quiver, travelersClothes],
        gold: 14,
      },
      { label: 'B', items: [], gold: 50 },
    ],
  },
};
