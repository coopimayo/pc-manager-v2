import type { Subclass } from '../../../types/class';

export const champion: Subclass = {
  id: 'champion',
  classId: 'fighter',
  name: 'Champion',
  description:
    'A relentless specimen of physical excellence, the Champion channels raw might and the honed perfection of martial technique into decisive, brutal strikes.',
  features: [
    {
      id: 'champion-improved-critical',
      name: 'Improved Critical',
      description:
        'Your attack rolls with weapons and Unarmed Strikes can score a Critical Hit on a roll of 19 or 20 on the d20.',
      level: 3,
      effects: [],
    },
    {
      id: 'champion-remarkable-athlete',
      name: 'Remarkable Athlete',
      description:
        'You have Advantage on Initiative rolls and Strength (Athletics) checks. In addition, immediately after you score a Critical Hit, you can move up to half your Speed without provoking Opportunity Attacks.',
      level: 3,
      effects: [],
    },
    {
      id: 'champion-additional-fighting-style',
      name: 'Additional Fighting Style',
      description: 'You gain another Fighting Style feat of your choice.',
      level: 7,
      effects: [{ kind: 'grantFeat', category: 'fighting-style' }],
    },
    {
      id: 'champion-heroic-warrior',
      name: 'Heroic Warrior',
      description:
        'During combat, you can give yourself Heroic Inspiration whenever you start your turn without it.',
      level: 10,
      effects: [],
    },
    {
      id: 'champion-superior-critical',
      name: 'Superior Critical',
      description:
        'Your attack rolls with weapons and Unarmed Strikes can now score a Critical Hit on a roll of 18–20.',
      level: 15,
      effects: [],
    },
    {
      id: 'champion-defy-death',
      name: 'Defy Death',
      description:
        'You have Advantage on Death Saving Throws. Moreover, when you roll 18–20 on a Death Saving Throw, you gain the benefit of rolling a 20 on it.',
      level: 18,
      effects: [],
    },
    {
      id: 'champion-heroic-rally',
      name: 'Heroic Rally',
      description:
        'At the start of each of your turns, you regain Hit Points equal to 5 plus your Constitution modifier if you are Bloodied and have at least 1 Hit Point.',
      level: 18,
      effects: [],
    },
  ],
};
