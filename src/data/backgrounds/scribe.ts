import type { Background } from '../../types';
import { calligraphersSupplies, fineClothes, lamp, oilFlask, parchment } from '../items';

export const scribe: Background = {
  id: 'scribe',
  name: 'Scribe',
  description:
    'You trained in a scriptorium or library, copying texts and mastering the written word.',
  abilityScores: ['dex', 'int', 'wis'],
  featId: 'skilled',
  skillProficiencies: ['investigation', 'perception'],
  toolProficiency: "Calligrapher's Supplies",
  startingEquipment: {
    choose: 1,
    from: [
      {
        label: 'A',
        items: [calligraphersSupplies, fineClothes, lamp, oilFlask, oilFlask, oilFlask, parchment],
        gold: 23,
      },
      { label: 'B', items: [], gold: 50 },
    ],
  },
};
