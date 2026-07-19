import type { Feat } from '../../types';

export const abilityScoreImprovement: Feat = {
  id: 'ability-score-improvement',
  name: 'Ability Score Improvement',
  description:
    'Increase one ability score by 2, or increase two ability scores by 1 each. You cannot raise a score above 20.',
  category: 'general',
  effects: [{ kind: 'abilityScoreChoice', points: 2, maxPerAbility: 2 }],
};

export const generalFeats: Feat[] = [abilityScoreImprovement];
