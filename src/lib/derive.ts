import type { Ability, Character, Die, Effect, Feat, LevelScaled, Skill } from '../types';
import type { Class, ClassFeature } from '../types/class';
import type { Weapon } from '../types/item';
import type {
  Sheet,
  SheetAbility,
  SheetAttack,
  SheetClass,
  SheetFeat,
  SheetFeature,
  SheetSkill,
} from '../types/sheet';
import { skillAbilities } from './skill-abilities';

type GrantAbility = Extract<Effect, { kind: 'grantAbility' }>;
type GrantWeaponMastery = Extract<Effect, { kind: 'grantWeaponMastery' }>;
type AttackRollBonus = Extract<Effect, { kind: 'attackRollBonus' }>;

interface TakenFeature {
  feature: ClassFeature;
  classLevel: number;
}

function resolveScaled(value: number | LevelScaled, classLevel: number): number {
  if (typeof value === 'number') return value;
  return value.steps
    .filter((step) => step.at <= classLevel)
    .reduce((best, step) => (step.at > best.at ? step : best), { at: 0, value: 0 }).value;
}

export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function proficiencyBonus(level: number): number {
  return 2 + Math.floor((level - 1) / 4);
}

function dieSize(die: Die): number {
  return Number(die.slice(1));
}

function grantsAbility(feature: ClassFeature): boolean {
  return feature.effects.some((effect) => effect.kind === 'grantAbility');
}

function featNote(feat: Feat): string | undefined {
  const applied = feat.effects.flatMap((effect) => {
    switch (effect.kind) {
      case 'attackRollBonus':
        return [`+${effect.amount} to ${effect.attackType} attack rolls`];
      case 'abilityScoreIncrease':
        return [`+${effect.amount} ${effect.ability.toUpperCase()}`];
      default:
        return [];
    }
  });
  return applied.length ? `Already included in your totals: ${applied.join(', ')}.` : undefined;
}

function featuresFor(character: Character, classes: Class[]): TakenFeature[] {
  return character.classes.flatMap((taken) => {
    const found = classes.find((entry) => entry.id === taken.classId);
    if (!found) return [];
    return found.features
      .filter((feature) => feature.level <= taken.level)
      .map((feature) => ({ feature, classLevel: taken.level }));
  });
}

function sheetFeature({ feature, classLevel }: TakenFeature): SheetFeature {
  const { id, name, description, level } = feature;
  const mastery = feature.effects.find(
    (effect): effect is GrantWeaponMastery => effect.kind === 'grantWeaponMastery',
  );
  const detail = mastery ? `${resolveScaled(mastery.count, classLevel)} weapons` : undefined;
  return { id, name, description, level, detail };
}

function hitPointsFor(character: Character, classes: Class[], conModifier: number): number {
  return character.classes.reduce((total, taken, index) => {
    const found = classes.find((entry) => entry.id === taken.classId);
    if (!found) return total;

    const size = dieSize(found.hitDie);
    const averageLevel = size / 2 + 1 + conModifier;

    if (index === 0) {
      return total + (size + conModifier) + (taken.level - 1) * averageLevel;
    }
    return total + taken.level * averageLevel;
  }, 0);
}

function attackAbility(weapon: Weapon, modifiers: Record<Ability, number>): Ability {
  if (weapon.attackType === 'ranged') return 'dex';
  if (weapon.properties.includes('finesse') && modifiers.dex > modifiers.str) return 'dex';
  return 'str';
}

function attacksFor(
  character: Character,
  weapons: Weapon[],
  feats: Feat[],
  modifiers: Record<Ability, number>,
  bonus: number,
): SheetAttack[] {
  const attackBonuses = character.featIds
    .flatMap((id) => feats.find((feat) => feat.id === id)?.effects ?? [])
    .filter((effect): effect is AttackRollBonus => effect.kind === 'attackRollBonus');

  return character.weaponIds.flatMap((id) => {
    const weapon = weapons.find((entry) => entry.id === id);
    if (!weapon) return [];

    const ability = attackAbility(weapon, modifiers);
    const modifier = modifiers[ability];
    const featBonus = attackBonuses
      .filter((effect) => effect.attackType === weapon.attackType)
      .reduce((total, effect) => total + effect.amount, 0);

    return [
      {
        name: weapon.name,
        attackBonus: modifier + bonus + featBonus,
        damage: {
          count: weapon.damage.count,
          die: weapon.damage.die,
          modifier,
          type: weapon.damage.type,
        },
      },
    ];
  });
}

export function derive(
  character: Character,
  classes: Class[],
  weapons: Weapon[] = [],
  feats: Feat[] = [],
): Sheet {
  const level = character.classes.reduce((total, taken) => total + taken.level, 0);
  const bonus = proficiencyBonus(level);

  const abilityModifiers: Record<Ability, number> = {
    str: abilityModifier(character.abilityScores.str),
    dex: abilityModifier(character.abilityScores.dex),
    con: abilityModifier(character.abilityScores.con),
    int: abilityModifier(character.abilityScores.int),
    wis: abilityModifier(character.abilityScores.wis),
    cha: abilityModifier(character.abilityScores.cha),
  };

  const skills: SheetSkill[] = (Object.keys(skillAbilities) as Skill[]).map((skill) => {
    const ability = skillAbilities[skill];
    const proficient = character.skillProficiencies.includes(skill);
    return {
      skill,
      ability,
      proficient,
      modifier: abilityModifiers[ability] + (proficient ? bonus : 0),
    };
  });

  const features = featuresFor(character, classes);

  const abilities: SheetAbility[] = features.flatMap(({ feature, classLevel }) =>
    feature.effects
      .filter((effect): effect is GrantAbility => effect.kind === 'grantAbility')
      .map(({ name, description, activation, uses }) => ({
        name,
        description,
        activation,
        uses: uses ? { count: resolveScaled(uses.count, classLevel), recharge: uses.recharge } : undefined,
      })),
  );

  const taken: SheetClass[] = character.classes.flatMap((entry) => {
    const found = classes.find((cls) => cls.id === entry.classId);
    return found ? [{ name: found.name, level: entry.level }] : [];
  });

  const characterFeats: SheetFeat[] = character.featIds.flatMap((id) => {
    const feat = feats.find((entry) => entry.id === id);
    if (!feat) return [];
    return [{ name: feat.name, description: feat.description, category: feat.category, note: featNote(feat) }];
  });

  return {
    name: character.name,
    classes: taken,
    level,
    proficiencyBonus: bonus,
    abilityScores: character.abilityScores,
    abilityModifiers,
    hitPoints: hitPointsFor(character, classes, abilityModifiers.con),
    skills,
    features: features
      .filter(({ feature }) => !grantsAbility(feature) && !feature.grantFeat)
      .map(sheetFeature),
    feats: characterFeats,
    abilities,
    attacks: attacksFor(character, weapons, feats, abilityModifiers, bonus),
  };
}
