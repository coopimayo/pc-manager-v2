import type { Background } from '../../types';
import { costume, mirror, musicalInstrument, perfume, travelersClothes } from '../items';

export const entertainer: Background = {
  id: 'entertainer',
  name: 'Entertainer',
  description:
    'You thrive in front of an audience, earning your keep with music, dance, and showmanship in taverns and theaters.',
  abilityScores: ['str', 'dex', 'cha'],
  featId: 'musician',
  skillProficiencies: ['acrobatics', 'performance'],
  toolProficiency: 'Musical Instrument',
  startingEquipment: {
    choose: 1,
    from: [
      {
        label: 'A',
        items: [musicalInstrument, costume, costume, mirror, perfume, travelersClothes],
        gold: 11,
      },
      { label: 'B', items: [], gold: 50 },
    ],
  },
};
