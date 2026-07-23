import type { Species } from '../../../types/species';

export const tiefling: Species = {
  id: 'tiefling',
  name: 'Tiefling',
  description:
    'Tieflings carry a fiendish legacy in their blood, an inheritance from the Lower Planes that marks them with horns, tails, and an uncanny presence. Whether that legacy springs from the demonic Abyss, the shadowed realms of death, or the ordered cruelty of the Nine Hells, tieflings channel its power into magic all their own.',
  creatureType: 'humanoid',
  size: 'medium',
  speed: 30,
  traits: [
    {
      id: 'tiefling-darkvision',
      name: 'Darkvision',
      description:
        'You have Darkvision with a range of 60 feet. In dim light you see as if it were bright light, and in darkness you see as if it were dim light. You discern colors in that darkness only as shades of gray.',
      effects: [{ kind: 'grantSense', sense: 'darkvision', range: 60 }],
    },
    {
      id: 'tiefling-otherworldly-presence',
      name: 'Otherworldly Presence',
      description:
        'You know the Thaumaturgy cantrip. When you cast it with this trait, the spell uses the same spellcasting ability you chose for your Fiendish Legacy trait.',
      effects: [
        {
          kind: 'grantSpells',
          castingAbility: 'choice',
          spells: [{ spellId: 'thaumaturgy' }],
        },
      ],
    },
  ],
};
