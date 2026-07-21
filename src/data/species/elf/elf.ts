import type { Species } from '../../../types/species';

export const elf: Species = {
  id: 'elf',
  name: 'Elf',
  description:
    'Elves are a magical people of otherworldly grace, living in the world but not entirely part of it. They love nature, art, and self-expression, and their lineages carry echoes of the fey realms from which they came.',
  creatureType: 'humanoid',
  size: 'medium',
  speed: 30,
  traits: [
    {
      id: 'elf-darkvision',
      name: 'Darkvision',
      description:
        'You have Darkvision with a range of 60 feet. In dim light you see as if it were bright light, and in darkness you see as if it were dim light. You discern colors in that darkness only as shades of gray.',
      effects: [],
    },
    {
      id: 'elf-elven-lineage',
      name: 'Elven Lineage',
      description:
        'You are part of a lineage that gives you supernatural abilities. Choose a lineage: Drow, High Elf, or Wood Elf. You gain that lineage\'s level 1 benefit, and you gain its further benefits when you reach character levels 3 and 5.',
      effects: [],
    },
    {
      id: 'elf-fey-ancestry',
      name: 'Fey Ancestry',
      description:
        'You have Advantage on saving throws you make to avoid or end the Charmed condition.',
      effects: [],
    },
    {
      id: 'elf-keen-senses',
      name: 'Keen Senses',
      description:
        'You have proficiency in the Insight, Perception, or Survival skill.',
      effects: [],
    },
    {
      id: 'elf-trance',
      name: 'Trance',
      description:
        'You don\'t need to sleep, and magic can\'t put you to sleep. You can finish a Long Rest in 4 hours if you spend those hours in a trancelike meditation, during which you retain consciousness.',
      effects: [],
    },
  ],
};
