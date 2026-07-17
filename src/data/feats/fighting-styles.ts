import type { Feat } from '../../types';

export const archery: Feat = {
  id: 'archery',
  name: 'Archery',
  description: 'You gain a +2 bonus to attack rolls you make with Ranged weapons.',
  category: 'fighting-style',
  prerequisite: 'Fighting Style Feature',
  effects: [{ kind: 'attackRollBonus', amount: 2, attackType: 'ranged' }],
};
