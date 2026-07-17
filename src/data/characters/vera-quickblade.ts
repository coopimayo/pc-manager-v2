import type { Character } from '../../types';

export const veraQuickblade: Character = {
  id: 'vera-quickblade',
  name: 'Vera Quickblade',
  speciesId: 'elf',
  backgroundId: 'criminal',
  classes: [{ classId: 'fighter', level: 3 }],
  abilityScores: { str: 10, dex: 17, con: 14, int: 12, wis: 13, cha: 8 },
  skillProficiencies: ['acrobatics', 'stealth'],
  featIds: [],
};
