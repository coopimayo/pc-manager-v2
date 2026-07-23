import type { Species } from '../../types/species';

export const aasimar: Species = {
  id: 'aasimar',
  name: 'Aasimar',
  description:
    'Aasimar are mortals who carry a spark of the Upper Planes within their souls. Born to serve as champions of the gods, they radiate celestial light and can unleash the power of their heritage against those who threaten the innocent.',
  creatureType: 'humanoid',
  size: 'medium',
  speed: 30,
  traits: [
    {
      id: 'aasimar-celestial-resistance',
      name: 'Celestial Resistance',
      description: 'You have Resistance to Necrotic damage and Radiant damage.',
      effects: [],
    },
    {
      id: 'aasimar-celestial-revelation',
      name: 'Celestial Revelation',
      description:
        'When you reach character level 3, you can transform as a Bonus Action, using one of the options below. The transformation lasts 1 minute or until you end it (no action required). Once you transform, you can\'t do so again until you finish a Long Rest. Once on each of your turns while transformed, you can deal extra damage of the given type to one target when you deal damage to it with an attack or a spell. The extra damage equals your Proficiency Bonus.\n\nHeavenly Wings. Two spectral wings sprout from your back. Until the transformation ends, you have a Fly Speed equal to your Speed. The extra damage is Radiant.\n\nInner Radiance. Searing light radiates from you. Until the transformation ends, you shed Bright Light in a 10-foot radius and Dim Light for an additional 10 feet, and at the end of each of your turns, each creature within 10 feet of you takes Radiant damage equal to your Proficiency Bonus. The extra damage is Radiant.\n\nNecrotic Shroud. Your eyes briefly become pools of darkness as ghostly, flightless wings sprout from your back. Creatures other than your allies within 10 feet of you must succeed on a Charisma saving throw (DC 8 plus your Charisma modifier and Proficiency Bonus) or have the Frightened condition until the end of your next turn. The extra damage is Necrotic.',
      effects: [
        {
          kind: 'grantAbility',
          name: 'Celestial Revelation',
          description:
            'Transform as a Bonus Action for 1 minute, gaining the benefits of your chosen revelation and dealing extra damage equal to your Proficiency Bonus once each turn.',
          activation: { type: 'bonus-action' },
          atLevel: 3,
          uses: { count: 1, recharge: [{ on: 'long-rest', amount: 'all' }] },
        },
      ],
    },
    {
      id: 'aasimar-darkvision',
      name: 'Darkvision',
      description:
        'You have Darkvision with a range of 60 feet. In dim light you see as if it were bright light, and in darkness you see as if it were dim light. You discern colors in that darkness only as shades of gray.',
      effects: [{ kind: 'grantSense', sense: 'darkvision', range: 60 }],
    },
    {
      id: 'aasimar-healing-hands',
      name: 'Healing Hands',
      description:
        'As a Magic action, you touch a creature and roll a number of d4s equal to your Proficiency Bonus. The creature regains a number of Hit Points equal to the roll total. Once you use this trait, you can\'t use it again until you finish a Long Rest.',
      effects: [
        {
          kind: 'grantAbility',
          name: 'Healing Hands',
          description:
            'Touch a creature and roll a number of d4s equal to your Proficiency Bonus; it regains Hit Points equal to the total.',
          activation: { type: 'action' },
          uses: { count: 1, recharge: [{ on: 'long-rest', amount: 'all' }] },
        },
      ],
    },
    {
      id: 'aasimar-light-bearer',
      name: 'Light Bearer',
      description:
        'You know the Light cantrip. Charisma is your spellcasting ability for it.',
      effects: [
        {
          kind: 'grantSpells',
          castingAbility: 'cha',
          spells: [{ spellId: 'light' }],
        },
      ],
    },
  ],
};
