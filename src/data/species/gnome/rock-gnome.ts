import type { Subspecies } from '../../../types/species';

export const rockGnome: Subspecies = {
  id: 'rock-gnome',
  speciesId: 'gnome',
  name: 'Rock Gnome',
  traits: [
    {
      id: 'rock-gnome-magic',
      name: 'Rock Gnome Magic',
      description:
        'You know the Mending and Prestidigitation cantrips. In addition, you can spend 10 minutes casting Prestidigitation to create a Tiny clockwork device (AC 5, 1 HP), such as a toy, a fire starter, or a music box. When you create the device, you determine its function by choosing one effect from Prestidigitation. You can have up to three such devices in existence at a time, and each one falls apart 8 hours after its creation or when you dismantle it. Intelligence, Wisdom, or Charisma is your spellcasting ability for these spells (choose when you select this lineage).',
      effects: [
        {
          kind: 'grantSpells',
          castingAbility: 'choice',
          spells: [{ spellId: 'mending' }, { spellId: 'prestidigitation' }],
        },
      ],
    },
  ],
};
