import type { Ability, Background, Character, Die, Effect, Feat, FeatCategory, LevelScaled, Skill } from '../types';
import type { Class, ClassFeature, Subclass } from '../types/class';
import type { Uses } from '../types/effect';
import type { AttackType, Weapon } from '../types/item';
import type { Species } from '../types/species';
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
type GrantFeat = Extract<Effect, { kind: 'grantFeat' }>;
type ReplaceFeature = Extract<Effect, { kind: 'replaceFeature' }>;
type AttackRollBonus = Extract<Effect, { kind: 'attackRollBonus' }>;
type InitiativeBonus = Extract<Effect, { kind: 'initiativeBonus' }>;
type HitPointMaxBonus = Extract<Effect, { kind: 'hitPointMaxBonus' }>;
type UnarmedStrikeDamage = Extract<Effect, { kind: 'unarmedStrikeDamage' }>;

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

export function grantedFeatCategory(feature: ClassFeature): FeatCategory | undefined {
  const effect = feature.effects.find((e): e is GrantFeat => e.kind === 'grantFeat');
  return effect?.category;
}

export function grantsSubclass(feature: ClassFeature): boolean {
  return feature.effects.some((effect) => effect.kind === 'grantSubclass');
}

function replacedFeatureIds(feature: ClassFeature): string[] {
  return feature.effects
    .filter((effect): effect is ReplaceFeature => effect.kind === 'replaceFeature')
    .map((effect) => effect.featureId);
}

function isAbilityScoreImprovement(feat: Feat): boolean {
  return feat.effects.some((effect) => effect.kind === 'abilityScoreChoice');
}

function initiativeAmount(effect: InitiativeBonus, proficiency: number): number {
  return effect.amount === 'proficiencyBonus' ? proficiency : effect.amount;
}

function resolveUses(
  uses: Uses | undefined,
  level: number,
  proficiency: number,
): SheetAbility['uses'] {
  if (!uses) return undefined;
  const count =
    uses.count === 'proficiencyBonus' ? proficiency : resolveScaled(uses.count, level);
  return { count, recharge: uses.recharge };
}

function featNote(feat: Feat, proficiency: number, level: number): string | undefined {
  const applied = feat.effects.flatMap((effect) => {
    switch (effect.kind) {
      case 'attackRollBonus':
        return [`+${effect.amount} to ${effect.attackType} attack rolls`];
      case 'abilityScoreIncrease':
        return [`+${effect.amount} ${effect.ability.toUpperCase()}`];
      case 'initiativeBonus':
        return [`+${initiativeAmount(effect, proficiency)} to Initiative`];
      case 'hitPointMaxBonus':
        return [`+${effect.amountPerLevel * level} Hit Points`];
      case 'unarmedStrikeDamage':
        return [`${effect.count}${effect.die} Unarmed Strike damage`];
      default:
        return [];
    }
  });
  return applied.length ? `Already included in your totals: ${applied.join(', ')}.` : undefined;
}

function abilityScoresFor(
  character: Character,
  feats: Feat[],
  featIds: string[],
): Record<Ability, number> {
  const totals: Record<Ability, number> = { ...character.abilityScores };
  const add = (ability: Ability, amount: number) => {
    totals[ability] = Math.min(20, totals[ability] + amount);
  };

  const chosen = character.abilityScoreIncreases ?? {};
  (Object.keys(chosen) as Ability[]).forEach((ability) => add(ability, chosen[ability] ?? 0));

  featIds.forEach((id) => {
    feats
      .find((feat) => feat.id === id)
      ?.effects.forEach((effect) => {
        if (effect.kind === 'abilityScoreIncrease') add(effect.ability, effect.amount);
      });
  });

  return totals;
}

function featuresFor(
  character: Character,
  classes: Class[],
  subclasses: Subclass[],
): TakenFeature[] {
  const taken = character.classes.flatMap((taken) => {
    const found = classes.find((entry) => entry.id === taken.classId);
    if (!found) return [];
    const subclass = taken.subclassId
      ? subclasses.find((entry) => entry.id === taken.subclassId)
      : undefined;
    return [...found.features, ...(subclass?.features ?? [])]
      .filter((feature) => feature.level <= taken.level)
      .map((feature) => ({ feature, classLevel: taken.level }));
  });

  const replaced = new Set(taken.flatMap(({ feature }) => replacedFeatureIds(feature)));
  return taken.filter(({ feature }) => !replaced.has(feature.id));
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
  featIds: string[],
  modifiers: Record<Ability, number>,
  bonus: number,
): SheetAttack[] {
  const featEffects = featIds.flatMap((id) => feats.find((feat) => feat.id === id)?.effects ?? []);
  const attackBonuses = featEffects.filter(
    (effect): effect is AttackRollBonus => effect.kind === 'attackRollBonus',
  );
  const featBonusFor = (attackType: AttackType) =>
    attackBonuses
      .filter((effect) => effect.attackType === attackType)
      .reduce((total, effect) => total + effect.amount, 0);

  const wielded = character.weaponIds.flatMap((id) => {
    const weapon = weapons.find((entry) => entry.id === id);
    if (!weapon) return [];

    const ability = attackAbility(weapon, modifiers);
    const modifier = modifiers[ability];

    return [
      {
        name: weapon.name,
        attackBonus: modifier + bonus + featBonusFor(weapon.attackType),
        damage: {
          count: weapon.damage.count,
          die: weapon.damage.die,
          modifier,
          type: weapon.damage.type,
        },
      },
    ];
  });

  return [...wielded, unarmedStrike(featEffects, modifiers.str, bonus + featBonusFor('melee'))];
}

function unarmedStrike(featEffects: Effect[], strength: number, bonus: number): SheetAttack {
  const upgrade = featEffects.find(
    (effect): effect is UnarmedStrikeDamage => effect.kind === 'unarmedStrikeDamage',
  );
  return {
    name: 'Unarmed Strike',
    attackBonus: strength + bonus,
    damage: upgrade
      ? { count: upgrade.count, die: upgrade.die, modifier: strength, type: 'bludgeoning' }
      : { flat: 1, modifier: strength, type: 'bludgeoning' },
  };
}

export function derive(
  character: Character,
  classes: Class[],
  weapons: Weapon[] = [],
  feats: Feat[] = [],
  subclasses: Subclass[] = [],
  species: Species[] = [],
  backgrounds: Background[] = [],
): Sheet {
  const level = character.classes.reduce((total, taken) => total + taken.level, 0);
  const bonus = proficiencyBonus(level);

  const chosenSpecies = species.find((entry) => entry.id === character.speciesId);
  const chosenBackground = backgrounds.find((entry) => entry.id === character.backgroundId);
  const featIds = [
    ...new Set([
      ...(chosenBackground ? [chosenBackground.featId] : []),
      ...character.featIds,
    ]),
  ];

  const abilityScores = abilityScoresFor(character, feats, featIds);
  const abilityModifiers: Record<Ability, number> = {
    str: abilityModifier(abilityScores.str),
    dex: abilityModifier(abilityScores.dex),
    con: abilityModifier(abilityScores.con),
    int: abilityModifier(abilityScores.int),
    wis: abilityModifier(abilityScores.wis),
    cha: abilityModifier(abilityScores.cha),
  };

  const skills: SheetSkill[] = (Object.keys(skillAbilities) as Skill[]).map((skill) => {
    const ability = skillAbilities[skill];
    const proficient =
      character.skillProficiencies.includes(skill) ||
      (chosenBackground?.skillProficiencies.includes(skill) ?? false);
    return {
      skill,
      ability,
      proficient,
      modifier: abilityModifiers[ability] + (proficient ? bonus : 0),
    };
  });

  const features = featuresFor(character, classes, subclasses);

  const abilities: SheetAbility[] = features.flatMap(({ feature, classLevel }) =>
    feature.effects
      .filter((effect): effect is GrantAbility => effect.kind === 'grantAbility')
      .map(({ name, description, activation, uses }) => ({
        name,
        description,
        activation,
        uses: resolveUses(uses, classLevel, bonus),
      })),
  );

  const taken: SheetClass[] = character.classes.flatMap((entry) => {
    const found = classes.find((cls) => cls.id === entry.classId);
    if (!found) return [];
    const subclass = entry.subclassId
      ? subclasses.find((cls) => cls.id === entry.subclassId)
      : undefined;
    return [{ name: found.name, subclass: subclass?.name, level: entry.level }];
  });

  const characterFeats: SheetFeat[] = featIds.flatMap((id) => {
    const feat = feats.find((entry) => entry.id === id);
    if (!feat || isAbilityScoreImprovement(feat)) return [];
    return [{ name: feat.name, description: feat.description, category: feat.category, note: featNote(feat, bonus, level) }];
  });

  const featEffects = featIds.flatMap((id) => feats.find((feat) => feat.id === id)?.effects ?? []);

  const initiative =
    abilityModifiers.dex +
    featEffects
      .filter((effect): effect is InitiativeBonus => effect.kind === 'initiativeBonus')
      .reduce((total, effect) => total + initiativeAmount(effect, bonus), 0);

  const hitPointMaxBonus = featEffects
    .filter((effect): effect is HitPointMaxBonus => effect.kind === 'hitPointMaxBonus')
    .reduce((total, effect) => total + effect.amountPerLevel * level, 0);

  const featAbilities: SheetAbility[] = featEffects
    .filter((effect): effect is GrantAbility => effect.kind === 'grantAbility')
    .map(({ name, description, activation, uses }) => ({
      name,
      description,
      activation,
      uses: resolveUses(uses, level, bonus),
    }));

  return {
    name: character.name,
    species: chosenSpecies?.name,
    background: chosenBackground?.name,
    classes: taken,
    level,
    proficiencyBonus: bonus,
    initiative,
    abilityScores,
    abilityModifiers,
    hitPoints: hitPointsFor(character, classes, abilityModifiers.con) + hitPointMaxBonus,
    skills,
    features: features
      .filter(
        ({ feature }) =>
          !grantsAbility(feature) && !grantedFeatCategory(feature) && !grantsSubclass(feature),
      )
      .map(sheetFeature),
    traits: (chosenSpecies?.traits ?? []).map(({ id, name, description }) => ({
      id,
      name,
      description,
    })),
    feats: characterFeats,
    abilities: [...abilities, ...featAbilities],
    attacks: attacksFor(character, weapons, feats, featIds, abilityModifiers, bonus),
  };
}
