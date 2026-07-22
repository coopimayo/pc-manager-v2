import type { Ability, Die, LevelScaled, Sense, Skill } from '../common';
import type { FeatCategory } from '../feat/feat-category';
import type { AttackType, WeaponProperty } from '../item';
import type { Activation } from './activation';
import type { Uses } from './uses';

export type Effect =
  | { kind: 'abilityScoreIncrease'; ability: Ability; amount: number }
  | { kind: 'abilityScoreChoice'; points: number; maxPerAbility: number }
  | {
      kind: 'grantSpells';
      spells: { spellId: string; atLevel?: number }[];
      castingAbility: Ability | 'choice';
    }
  | { kind: 'grantAbility'; name: string; description: string; activation: Activation; uses?: Uses; atLevel?: number }
  | { kind: 'grantWeaponMastery'; count: number | LevelScaled }
  | { kind: 'grantProficiency'; skill: Skill }
  | { kind: 'skillProficiencyChoice'; count: number; from?: Skill[] }
  | { kind: 'grantFeat'; category: FeatCategory }
  | { kind: 'grantSubclass' }
  | { kind: 'replaceFeature'; featureId: string }
  | { kind: 'attackRollBonus'; amount: number; attackType: AttackType }
  | {
      kind: 'damageRollBonus';
      amount: number;
      attackType?: AttackType;
      weaponProperty?: WeaponProperty;
      withoutProperty?: WeaponProperty;
      soleWeapon?: boolean;
    }
  | { kind: 'initiativeBonus'; amount: number | 'proficiencyBonus' }
  | { kind: 'hitPointMaxBonus'; amountPerLevel: number }
  | { kind: 'unarmedStrikeDamage'; count: number; die: Die }
  | { kind: 'grantSense'; sense: Sense; range: number };
