import type { Species } from '../../types/species';

export const orc: Species = {
  id: 'orc',
  name: 'Orc',
  description:
    'Orcs trace their lineage to the relentless will of Gruumsh, and they carry his gifts of ferocity and endurance in their blood. They charge headlong into danger with a surge of unstoppable vigor, and they refuse to fall while a fight remains to be won.',
  creatureType: 'humanoid',
  size: 'medium',
  speed: 30,
  traits: [
    {
      id: 'orc-adrenaline-rush',
      name: 'Adrenaline Rush',
      description:
        'You can take the Dash action as a Bonus Action. When you do so, you gain a number of Temporary Hit Points equal to your Proficiency Bonus. You can use this trait a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Short or Long Rest.',
      effects: [
        {
          kind: 'grantAbility',
          name: 'Adrenaline Rush',
          description:
            'Take the Dash action as a Bonus Action and gain Temporary Hit Points equal to your Proficiency Bonus.',
          activation: { type: 'bonus-action' },
          uses: { count: 'proficiencyBonus', recharge: [{ on: 'short-rest', amount: 'all' }] },
        },
      ],
    },
    {
      id: 'orc-darkvision',
      name: 'Darkvision',
      description:
        'You have Darkvision with a range of 120 feet. In dim light you see as if it were bright light, and in darkness you see as if it were dim light. You discern colors in that darkness only as shades of gray.',
      effects: [],
    },
    {
      id: 'orc-relentless-endurance',
      name: 'Relentless Endurance',
      description:
        'When you are reduced to 0 Hit Points but not killed outright, you can drop to 1 Hit Point instead. Once you use this trait, you can\'t do so again until you finish a Long Rest.',
      effects: [
        {
          kind: 'grantAbility',
          name: 'Relentless Endurance',
          description:
            'When you are reduced to 0 Hit Points but not killed outright, drop to 1 Hit Point instead.',
          activation: { type: 'free' },
          uses: { count: 1, recharge: [{ on: 'long-rest', amount: 'all' }] },
        },
      ],
    },
  ],
};
