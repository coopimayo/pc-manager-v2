import type { Background } from '../../types';
import { bookOfPrayers, calligraphersSupplies, holySymbol, parchmentTen, robe } from '../items';

export const acolyte: Background = {
  id: 'acolyte',
  name: 'Acolyte',
  description:
    'You served in a temple, learning sacred rites, prayers, and the tenets of your faith.',
  abilityScores: ['int', 'wis', 'cha'],
  featId: 'magic-initiate-cleric',
  skillProficiencies: ['insight', 'religion'],
  toolProficiency: "Calligrapher's Supplies",
  startingEquipment: {
    choose: 1,
    from: [
      {
        label: 'A',
        items: [calligraphersSupplies, bookOfPrayers, holySymbol, parchmentTen, robe],
        gold: 8,
      },
      { label: 'B', items: [], gold: 50 },
    ],
  },
};
