import type { Species } from '../../../types/species';

export const dragonborn: Species = {
  id: 'dragonborn',
  name: 'Dragonborn',
  description:
    'Dragonborn walk the world with draconic blood in their veins, tracing their lineage to a dragon progenitor. Proud and self-reliant, they exhale the fury of their ancestors as a breath weapon and, in time, sprout wings of pure draconic energy.',
  creatureType: 'humanoid',
  size: 'medium',
  speed: 30,
  traits: [
    {
      id: 'dragonborn-draconic-ancestry',
      name: 'Draconic Ancestry',
      description:
        'Your lineage stems from a dragon progenitor. Choose the kind of dragon from the Draconic Ancestors table. Your choice affects your Breath Weapon and Damage Resistance traits as well as your appearance.\n\nBlack (Acid), Blue (Lightning), Brass (Fire), Bronze (Lightning), Copper (Acid), Gold (Fire), Green (Poison), Red (Fire), Silver (Cold), White (Cold).',
      effects: [],
    },
    {
      id: 'dragonborn-breath-weapon',
      name: 'Breath Weapon',
      description:
        'When you take the Attack action on your turn, you can replace one of your attacks with an exhalation of magical energy in either a 15-foot Cone or a 30-foot Line that is 5 feet wide (choose the shape each time). Each creature in that area must make a Dexterity saving throw (DC 8 plus your Constitution modifier and Proficiency Bonus). On a failed save, a creature takes 1d10 damage of the type determined by your Draconic Ancestry trait. On a successful save, a creature takes half as much damage. This damage increases by 1d10 when you reach character levels 5 (2d10), 11 (3d10), and 17 (4d10). You can use this Breath Weapon a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Long Rest.',
      effects: [
        {
          kind: 'grantAbility',
          name: 'Breath Weapon',
          description:
            'Replace one attack with a 15-foot Cone or 30-foot Line of your Draconic Ancestry\'s damage type. Each creature there makes a Dexterity save (DC 8 plus your Constitution modifier and Proficiency Bonus), taking 1d10 damage on a failure or half as much on a success. The damage rises to 2d10 at level 5, 3d10 at 11, and 4d10 at 17.',
          activation: { type: 'action' },
          uses: { count: 'proficiencyBonus', recharge: [{ on: 'long-rest', amount: 'all' }] },
        },
      ],
    },
    {
      id: 'dragonborn-darkvision',
      name: 'Darkvision',
      description:
        'You have Darkvision with a range of 60 feet. In dim light you see as if it were bright light, and in darkness you see as if it were dim light. You discern colors in that darkness only as shades of gray.',
      effects: [],
    },
    {
      id: 'dragonborn-draconic-flight',
      name: 'Draconic Flight',
      description:
        'When you reach character level 5, you can channel draconic magic to give yourself temporary flight. As a Bonus Action, you sprout spectral wings on your back that last for 10 minutes or until you retract the wings (no action required) or have the Incapacitated condition. During that time, you have a Fly Speed equal to your Speed. Your wings appear to be made of the same energy as your Breath Weapon. Once you use this trait, you can\'t use it again until you finish a Long Rest.',
      effects: [
        {
          kind: 'grantAbility',
          name: 'Draconic Flight',
          description:
            'Sprout spectral wings as a Bonus Action for 10 minutes, gaining a Fly Speed equal to your Speed.',
          activation: { type: 'bonus-action' },
          atLevel: 5,
          uses: { count: 1, recharge: [{ on: 'long-rest', amount: 'all' }] },
        },
      ],
    },
  ],
};
