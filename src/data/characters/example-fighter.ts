import type { Character } from '../../types';

export const exampleFighter: Character = {
  id: 'example-fighter',
  name: 'Bram Stonefist',
  speciesId: 'human',
  backgroundId: 'soldier',
  classes: [{ classId: 'fighter', level: 1 }],
  abilityScores: { str: 16, dex: 13, con: 15, int: 10, wis: 12, cha: 8 },
  skillProficiencies: ['athletics', 'intimidation'],
  featIds: [],
};
