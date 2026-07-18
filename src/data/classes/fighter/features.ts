import type { ClassFeature } from '../../../types/class';

export const fighterFeatures: ClassFeature[] = [
  {
    id: 'fighter-fighting-style',
    name: 'Fighting Style',
    description: 'You gain a Fighting Style feat of your choice.',
    level: 1,
    effects: [{ kind: 'grantFeat', category: 'fighting-style' }],
  },
  {
    id: 'fighter-second-wind',
    name: 'Second Wind',
    description:
      'As a Bonus Action, you can regain Hit Points equal to 1d10 plus your Fighter level. You have two uses, regaining one on a Short Rest and all on a Long Rest.',
    level: 1,
    effects: [
      {
        kind: 'grantAbility',
        name: 'Second Wind',
        description: 'Regain Hit Points equal to 1d10 plus your Fighter level.',
        activation: { type: 'bonus-action' },
        uses: {
          count: { steps: [{ at: 1, value: 2 }, { at: 4, value: 3 }, { at: 10, value: 4 }] },
          recharge: [
            { on: 'short-rest', amount: 1 },
            { on: 'long-rest', amount: 'all' },
          ],
        },
      },
    ],
  },
  {
    id: 'fighter-weapon-mastery',
    name: 'Weapon Mastery',
    description:
      'You can use the mastery properties of Simple or Martial weapons of your choice.',
    level: 1,
    effects: [
      {
        kind: 'grantWeaponMastery',
        count: { steps: [{ at: 1, value: 3 }, { at: 4, value: 4 }, { at: 10, value: 5 }, { at: 16, value: 6 }] },
      },
    ],
  },
  {
    id: 'fighter-action-surge',
    name: 'Action Surge',
    description:
      'On your turn, you can take one additional action, except the Magic action. Once you use this feature, you must finish a Short or Long Rest to use it again.',
    level: 2,
    effects: [
      {
        kind: 'grantAbility',
        name: 'Action Surge',
        description: 'Take one additional action, except the Magic action.',
        activation: { type: 'free' },
        uses: { count: 1, recharge: [{ on: 'short-rest', amount: 'all' }] },
      },
    ],
  },
  {
    id: 'fighter-tactical-mind',
    name: 'Tactical Mind',
    description:
      'When you fail an ability check, you can expend a use of Second Wind to add 1d10 to the roll. If it still fails, the use is not expended.',
    level: 2,
    effects: [],
  },
  {
    id: 'fighter-subclass',
    name: 'Fighter Subclass',
    description:
      'You gain a Fighter subclass of your choice, which grants you features at levels 3, 7, 10, and 15.',
    level: 3,
    effects: [{ kind: 'grantSubclass' }],
  },
  {
    id: 'fighter-asi-4',
    name: 'Ability Score Improvement',
    description:
      'You gain the Ability Score Improvement feat or another feat of your choice for which you qualify.',
    level: 4,
    effects: [{ kind: 'grantFeat', category: 'general' }],
  },
  {
    id: 'fighter-extra-attack',
    name: 'Extra Attack',
    description: 'You can attack twice, instead of once, whenever you take the Attack action on your turn.',
    level: 5,
    effects: [],
  },
  {
    id: 'fighter-tactical-shift',
    name: 'Tactical Shift',
    description:
      'Whenever you activate Second Wind with a Bonus Action, you can move up to half your Speed without provoking Opportunity Attacks.',
    level: 5,
    effects: [],
  },
];
