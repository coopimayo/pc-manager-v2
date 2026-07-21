import type { Subspecies } from '../../../types/species';

export const woodElf: Subspecies = {
  id: 'wood-elf',
  speciesId: 'elf',
  name: 'Wood Elf',
  traits: [
    {
      id: 'wood-elf-fleet-of-foot',
      name: 'Fleet of Foot',
      description: 'Your Speed increases to 35 feet.',
      effects: [],
    },
    {
      id: 'wood-elf-magic',
      name: 'Wood Elf Magic',
      description:
        'You know the Druidcraft cantrip. Starting at character level 3, you can cast the Longstrider spell with this trait, and starting at level 5, you can also cast the Pass without Trace spell with it. Once you cast Longstrider or Pass without Trace with this trait, you can\'t cast that spell with it again until you finish a Long Rest. You can also cast these spells using any spell slots you have. Intelligence, Wisdom, or Charisma is your spellcasting ability for them (choose when you select this lineage).',
      effects: [
        {
          kind: 'grantSpells',
          castingAbility: 'choice',
          spells: [
            { spellId: 'druidcraft' },
            { spellId: 'longstrider', atLevel: 3 },
            { spellId: 'pass-without-trace', atLevel: 5 },
          ],
        },
      ],
    },
  ],
};
