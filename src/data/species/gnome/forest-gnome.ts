import type { Subspecies } from '../../../types/species';

export const forestGnome: Subspecies = {
  id: 'forest-gnome',
  speciesId: 'gnome',
  name: 'Forest Gnome',
  traits: [
    {
      id: 'forest-gnome-magic',
      name: 'Forest Gnome Magic',
      description:
        'You know the Minor Illusion cantrip. You also always have the Speak with Animals spell prepared. You can cast it without a spell slot a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Long Rest. You can also cast the spell using any spell slots you have. Intelligence, Wisdom, or Charisma is your spellcasting ability for these spells (choose when you select this lineage).',
      effects: [
        {
          kind: 'grantSpells',
          castingAbility: 'choice',
          spells: [{ spellId: 'minor-illusion' }, { spellId: 'speak-with-animals' }],
        },
      ],
    },
  ],
};
