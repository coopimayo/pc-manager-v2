import type { Subspecies } from '../../../types/species';

export const drow: Subspecies = {
  id: 'drow',
  speciesId: 'elf',
  name: 'Drow',
  traits: [
    {
      id: 'drow-superior-darkvision',
      name: 'Superior Darkvision',
      description: 'The range of your Darkvision increases to 120 feet.',
      effects: [],
    },
    {
      id: 'drow-magic',
      name: 'Drow Magic',
      description:
        'You know the Dancing Lights cantrip. Starting at character level 3, you can cast the Faerie Fire spell with this trait, and starting at level 5, you can also cast the Darkness spell with it. Once you cast Faerie Fire or Darkness with this trait, you can\'t cast that spell with it again until you finish a Long Rest. You can also cast these spells using any spell slots you have. Intelligence, Wisdom, or Charisma is your spellcasting ability for them (choose when you select this lineage).',
      effects: [],
    },
  ],
};
