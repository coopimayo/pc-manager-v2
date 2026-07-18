import type { Feat } from '../../types';

export const abilityScoreImprovement: Feat = {
  id: 'ability-score-improvement',
  name: 'Ability Score Improvement',
  description:
    'Increase one ability score by 2, or increase two ability scores by 1 each. You cannot raise a score above 20.',
  category: 'general',
  effects: [{ kind: 'abilityScoreChoice', points: 2, maxPerAbility: 2 }],
};

export const alert: Feat = {
  id: 'alert',
  name: 'Alert',
  description:
    'You gain a bonus to Initiative equal to your Proficiency Bonus, and you can swap Initiative with a willing ally.',
  category: 'general',
  effects: [],
};

export const tough: Feat = {
  id: 'tough',
  name: 'Tough',
  description: 'Your Hit Point maximum increases by an amount equal to twice your character level.',
  category: 'general',
  effects: [],
};

export const lucky: Feat = {
  id: 'lucky',
  name: 'Lucky',
  description:
    'You have Luck Points equal to your Proficiency Bonus to gain Advantage on a roll or impose Disadvantage on an attack against you.',
  category: 'general',
  effects: [],
};

export const savageAttacker: Feat = {
  id: 'savage-attacker',
  name: 'Savage Attacker',
  description:
    'Once per turn when you hit with a weapon, you can roll its damage dice twice and use either roll.',
  category: 'general',
  effects: [],
};

export const generalFeats: Feat[] = [abilityScoreImprovement, alert, tough, lucky, savageAttacker];
