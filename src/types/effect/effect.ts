import type { Ability, Skill } from '../common';
import type { Activation } from './activation';
import type { Uses } from './uses';

export type Effect =
  | { kind: 'abilityScoreIncrease'; ability: Ability; amount: number }
  | { kind: 'grantSpells'; spellIds: string[]; castingAbility: Ability }
  | { kind: 'grantAbility'; name: string; description: string; activation: Activation; uses?: Uses }
  | { kind: 'grantProficiency'; skill: Skill };
