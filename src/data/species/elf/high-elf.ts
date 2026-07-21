import type { Subspecies } from '../../../types/species';

export const highElf: Subspecies = {
  id: 'high-elf',
  speciesId: 'elf',
  name: 'High Elf',
  traits: [
    {
      id: 'high-elf-magic',
      name: 'High Elf Magic',
      description:
        'You know the Prestidigitation cantrip. Whenever you finish a Long Rest, you can replace it with a different cantrip from the Wizard spell list. Starting at character level 3, you can cast the Detect Magic spell with this trait, and starting at level 5, you can also cast the Misty Step spell with it. Once you cast Detect Magic or Misty Step with this trait, you can\'t cast that spell with it again until you finish a Long Rest. You can also cast these spells using any spell slots you have. Intelligence, Wisdom, or Charisma is your spellcasting ability for them (choose when you select this lineage).',
      effects: [
        {
          kind: 'grantSpells',
          castingAbility: 'choice',
          spells: [
            { spellId: 'prestidigitation' },
            { spellId: 'detect-magic', atLevel: 3 },
            { spellId: 'misty-step', atLevel: 5 },
          ],
        },
      ],
    },
  ],
};
