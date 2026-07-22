import type { Activation } from '../../../types/effect';
import type { Subspecies } from '../../../types/species';

const giantAncestries: {
  id: string;
  giant: string;
  boon: string;
  activation: Activation;
  description: string;
  summary: string;
}[] = [
  {
    id: 'cloud',
    giant: 'Cloud Giant',
    boon: "Cloud's Jaunt",
    activation: { type: 'bonus-action' },
    description:
      'As a Bonus Action, you magically teleport up to 30 feet to an unoccupied space you can see.',
    summary: 'As a Bonus Action, teleport up to 30 feet to an unoccupied space you can see.',
  },
  {
    id: 'fire',
    giant: 'Fire Giant',
    boon: "Fire's Burn",
    activation: { type: 'free' },
    description:
      'When you hit a target with an attack roll and deal damage to it, you can also deal 1d10 Fire damage to that target.',
    summary:
      'When you hit a target with an attack roll and deal damage, deal an extra 1d10 Fire damage to it.',
  },
  {
    id: 'frost',
    giant: 'Frost Giant',
    boon: "Frost's Chill",
    activation: { type: 'free' },
    description:
      'When you hit a target with an attack roll and deal damage to it, you can also deal 1d6 Cold damage to that target and reduce its Speed by 10 feet until the start of your next turn.',
    summary:
      'When you hit a target with an attack roll and deal damage, deal an extra 1d6 Cold damage to it and reduce its Speed by 10 feet until the start of your next turn.',
  },
  {
    id: 'hill',
    giant: 'Hill Giant',
    boon: "Hill's Tumble",
    activation: { type: 'free' },
    description:
      'When you hit a Large or smaller creature with an attack roll and deal damage to it, you can give that target the Prone condition.',
    summary:
      'When you hit a Large or smaller creature with an attack roll and deal damage, give it the Prone condition.',
  },
  {
    id: 'stone',
    giant: 'Stone Giant',
    boon: "Stone's Endurance",
    activation: { type: 'reaction', trigger: 'When you take damage' },
    description:
      'When you take damage, you can take a Reaction to roll 1d12. Add your Constitution modifier to the number rolled, and reduce the damage by that total.',
    summary:
      'Take a Reaction when you take damage to roll 1d12, add your Constitution modifier, and reduce the damage by the total.',
  },
  {
    id: 'storm',
    giant: 'Storm Giant',
    boon: "Storm's Thunder",
    activation: {
      type: 'reaction',
      trigger: 'When you take damage from a creature within 60 feet of you',
    },
    description:
      'When you take damage from a creature within 60 feet of you, you can take a Reaction to deal 1d8 Thunder damage to that creature.',
    summary:
      'Take a Reaction when a creature within 60 feet of you damages you to deal 1d8 Thunder damage to it.',
  },
];

export const goliathSubspecies: Subspecies[] = giantAncestries.map(
  ({ id, giant, boon, activation, description, summary }) => ({
    id: `goliath-${id}`,
    speciesId: 'goliath',
    name: giant,
    traits: [
      {
        id: `goliath-${id}-boon`,
        name: boon,
        description: `${description} You can use this boon a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Long Rest.`,
        effects: [
          {
            kind: 'grantAbility',
            name: boon,
            description: summary,
            activation,
            uses: { count: 'proficiencyBonus', recharge: [{ on: 'long-rest', amount: 'all' }] },
          },
        ],
      },
    ],
  }),
);
