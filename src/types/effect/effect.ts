import type { Ability, LevelScaled, Skill } from '../common';
import type { FeatCategory } from '../feat/feat-category';
import type { AttackType } from '../item';
import type { Activation } from './activation';
import type { Uses } from './uses';

export type Effect =
  | { kind: 'abilityScoreIncrease'; ability: Ability; amount: number }
  | { kind: 'abilityScoreChoice'; points: number; maxPerAbility: number }
  | { kind: 'grantSpells'; spellIds: string[]; castingAbility: Ability }
  | { kind: 'grantAbility'; name: string; description: string; activation: Activation; uses?: Uses }
  | { kind: 'grantWeaponMastery'; count: number | LevelScaled }
  | { kind: 'grantProficiency'; skill: Skill }
  | { kind: 'grantFeat'; category: FeatCategory }
  | { kind: 'grantSubclass' }
  | { kind: 'replaceFeature'; featureId: string }
  | { kind: 'attackRollBonus'; amount: number; attackType: AttackType }
  | { kind: 'initiativeBonus'; amount: number | 'proficiencyBonus' };
