import type { Background } from '../../types';
import { bookOfHistory, calligraphersSupplies, parchmentEight, quarterstaff, robe } from '../items';

export const sage: Background = {
  id: 'sage',
  name: 'Sage',
  description:
    'You spent your years among books and scholars, chasing knowledge for its own sake.',
  abilityScores: ['con', 'int', 'wis'],
  featId: 'magic-initiate-wizard',
  skillProficiencies: ['arcana', 'history'],
  toolProficiency: "Calligrapher's Supplies",
  startingEquipment: {
    choose: 1,
    from: [
      {
        label: 'A',
        items: [quarterstaff, calligraphersSupplies, bookOfHistory, parchmentEight, robe],
        gold: 8,
      },
      { label: 'B', items: [], gold: 50 },
    ],
  },
};
