import type { Background } from '../../types';
import { costume, fineClothes, forgeryKit } from '../items';

export const charlatan: Background = {
  id: 'charlatan',
  name: 'Charlatan',
  description:
    'You learned to survive on wit and charm, parting fools from their money with schemes, disguises, and forged papers.',
  abilityScores: ['dex', 'con', 'cha'],
  featId: 'skilled',
  skillProficiencies: ['deception', 'sleight-of-hand'],
  toolProficiency: 'Forgery Kit',
  startingEquipment: {
    choose: 1,
    from: [
      { label: 'A', items: [forgeryKit, costume, fineClothes], gold: 15 },
      { label: 'B', items: [], gold: 50 },
    ],
  },
};
