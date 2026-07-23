import type { Species } from '../../types/species';

export const dwarf: Species = {
  id: 'dwarf',
  name: 'Dwarf',
  description:
    'Dwarves have a strong bond with the earth, an affinity for stonework and metalcraft, and a longevity that lets them remember grudges and glories alike for centuries. Their bodies carry a resilience that shrugs off poison, and their kin cut cities and strongholds from the living rock.',
  creatureType: 'humanoid',
  size: 'medium',
  speed: 30,
  traits: [
    {
      id: 'dwarf-darkvision',
      name: 'Darkvision',
      description:
        'You have Darkvision with a range of 120 feet. In dim light you see as if it were bright light, and in darkness you see as if it were dim light. You discern colors in that darkness only as shades of gray.',
      effects: [{ kind: 'grantSense', sense: 'darkvision', range: 120 }],
    },
    {
      id: 'dwarf-dwarven-resilience',
      name: 'Dwarven Resilience',
      description:
        'You have Resistance to Poison damage. You also have Advantage on saving throws you make to avoid or end the Poisoned condition.',
      effects: [],
    },
    {
      id: 'dwarf-dwarven-toughness',
      name: 'Dwarven Toughness',
      description:
        'Your Hit Point maximum increases by 1, and it increases by 1 again whenever you gain a level.',
      effects: [{ kind: 'hitPointMaxBonus', amountPerLevel: 1 }],
    },
    {
      id: 'dwarf-stonecunning',
      name: 'Stonecunning',
      description:
        'As a Bonus Action, you gain Tremorsense with a range of 60 feet for 10 minutes. You must be on a stone surface or touching such a surface to use this Tremorsense. The stone can be natural or worked. You can use this Bonus Action a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Long Rest.',
      effects: [
        {
          kind: 'grantAbility',
          name: 'Stonecunning',
          description:
            'Gain Tremorsense with a range of 60 feet for 10 minutes while on or touching a stone surface.',
          activation: { type: 'bonus-action' },
          uses: { count: 'proficiencyBonus', recharge: [{ on: 'long-rest', amount: 'all' }] },
        },
      ],
    },
  ],
};
