import type { Ability, Background, Character, Die, Effect, Feat, FeatCategory, LevelScaled, Sense, Skill } from '../types';
import type { Class, ClassFeature, Subclass } from '../types/class';
import type { Uses } from '../types/effect';
import type { AttackType, Tool, Weapon } from '../types/item';
import type { Species, Subspecies, Trait } from '../types/species';
import type { Spell } from '../types/spell';
import type {
  Sheet,
  SheetAbility,
  SheetAttack,
  SheetClass,
  SheetFeat,
  SheetFeature,
  SheetSense,
  SheetSkill,
  SheetSpell,
  SheetSpellSlot,
  SheetTool,
} from '../types/sheet';
import { effectOfKind, effectsOfKind, type EffectOfKind } from './effects';
import { titleCase } from './format';
import { skillAbilities } from './skill-abilities';

export interface DeriveData {
  classes?: Class[];
  weapons?: Weapon[];
  tools?: Tool[];
  feats?: Feat[];
  subclasses?: Subclass[];
  species?: Species[];
  subspecies?: Subspecies[];
  backgrounds?: Background[];
  spells?: Spell[];
}

interface ResolvedClass {
  definition: Class;
  subclass: Subclass | undefined;
  level: number;
}

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

export function grantedFeatCategory(feature: ClassFeature): FeatCategory | undefined {
  return effectOfKind(feature.effects, 'grantFeat')?.category;
}

export function grantsSubclass(feature: ClassFeature): boolean {
  return feature.effects.some((effect) => effect.kind === 'grantSubclass');
}

export function grantedSpellIds(traits: Trait[], characterLevel: number): string[] {
  return traits
    .flatMap((trait) => effectsOfKind(trait.effects, 'grantSpells'))
    .flatMap((effect) => effect.spells)
    .filter((spell) => (spell.atLevel ?? 1) <= characterLevel)
    .map((spell) => spell.spellId);
}

export function grantsCastingChoice(traits: Trait[]): boolean {
  return traits
    .flatMap((trait) => effectsOfKind(trait.effects, 'grantSpells'))
    .some((effect) => effect.castingAbility === 'choice');
}

function isAbilityScoreImprovement(feat: Feat): boolean {
  return feat.effects.some((effect) => effect.kind === 'abilityScoreChoice');
}

function initiativeAmount(effect: EffectOfKind<'initiativeBonus'>, proficiency: number): number {
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

function damageBonusScope(effect: EffectOfKind<'damageRollBonus'>): string {
  if (effect.weaponProperty) return `${titleCase(effect.weaponProperty)} weapon`;
  if (effect.attackType) return `${effect.attackType} weapon`;
  return 'weapon';
}

function featNote(feat: Feat, proficiency: number, level: number): string | undefined {
  const applied = feat.effects.flatMap((effect) => {
    switch (effect.kind) {
      case 'attackRollBonus':
        return [`+${effect.amount} to ${effect.attackType} attack rolls`];
      case 'damageRollBonus':
        return effect.soleWeapon
          ? []
          : [`+${effect.amount} to ${damageBonusScope(effect)} damage rolls`];
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

function abilityScoresFor(character: Character, featEffects: Effect[]): Record<Ability, number> {
  const totals: Record<Ability, number> = { ...character.abilityScores };
  const add = (ability: Ability, amount: number) => {
    totals[ability] = Math.min(20, totals[ability] + amount);
  };

  const chosen = character.abilityScoreIncreases ?? {};
  (Object.keys(chosen) as Ability[]).forEach((ability) => add(ability, chosen[ability] ?? 0));
  effectsOfKind(featEffects, 'abilityScoreIncrease').forEach((effect) =>
    add(effect.ability, effect.amount),
  );

  return totals;
}

function resolveClasses(
  character: Character,
  classes: Class[],
  subclasses: Subclass[],
): ResolvedClass[] {
  return character.classes.flatMap((taken) => {
    const definition = classes.find((entry) => entry.id === taken.classId);
    if (!definition) return [];
    const subclass = taken.subclassId
      ? subclasses.find((entry) => entry.id === taken.subclassId)
      : undefined;
    return [{ definition, subclass, level: taken.level }];
  });
}

function featuresFor(taken: ResolvedClass[]): TakenFeature[] {
  const all = taken.flatMap(({ definition, subclass, level }) =>
    [...definition.features, ...(subclass?.features ?? [])]
      .filter((feature) => feature.level <= level)
      .map((feature) => ({ feature, classLevel: level })),
  );

  const replaced = new Set(
    all.flatMap(({ feature }) =>
      effectsOfKind(feature.effects, 'replaceFeature').map((effect) => effect.featureId),
    ),
  );
  return all.filter(({ feature }) => !replaced.has(feature.id));
}

function sheetFeature({ feature, classLevel }: TakenFeature, hidden: boolean): SheetFeature {
  const { id, name, description, level } = feature;
  const mastery = effectOfKind(feature.effects, 'grantWeaponMastery');
  const detail = mastery ? `${resolveScaled(mastery.count, classLevel)} weapons` : undefined;
  return { id, name, description, level, detail, hidden };
}

function hitPointsFor(taken: ResolvedClass[], conModifier: number): number {
  return taken.reduce((total, { definition, level }, index) => {
    const size = dieSize(definition.hitDie);
    const averageLevel = size / 2 + 1 + conModifier;

    if (index === 0) {
      return total + (size + conModifier) + (level - 1) * averageLevel;
    }
    return total + level * averageLevel;
  }, 0);
}

function sheetAbilities(effects: Effect[], level: number, proficiency: number): SheetAbility[] {
  return effectsOfKind(effects, 'grantAbility')
    .filter((effect) => (effect.atLevel ?? 1) <= level)
    .map(({ name, description, activation, uses }) => ({
      name,
      description,
      activation,
      uses: resolveUses(uses, level, proficiency),
    }));
}

function attackAbility(weapon: Weapon, modifiers: Record<Ability, number>): Ability {
  if (weapon.attackType === 'ranged') return 'dex';
  if (weapon.properties.includes('finesse') && modifiers.dex > modifiers.str) return 'dex';
  return 'str';
}

function damageBonusApplies(
  effect: EffectOfKind<'damageRollBonus'>,
  weapon: Weapon,
  soleWeapon: boolean,
): boolean {
  if (effect.attackType && weapon.attackType !== effect.attackType) return false;
  if (effect.weaponProperty && !weapon.properties.includes(effect.weaponProperty)) return false;
  if (effect.withoutProperty && weapon.properties.includes(effect.withoutProperty)) return false;
  if (effect.soleWeapon && !soleWeapon) return false;
  return true;
}

function attacksFor(
  character: Character,
  weapons: Weapon[],
  featEffects: Effect[],
  modifiers: Record<Ability, number>,
  bonus: number,
): SheetAttack[] {
  const attackBonuses = effectsOfKind(featEffects, 'attackRollBonus');
  const featBonusFor = (attackType: AttackType) =>
    attackBonuses
      .filter((effect) => effect.attackType === attackType)
      .reduce((total, effect) => total + effect.amount, 0);

  const damageBonuses = effectsOfKind(featEffects, 'damageRollBonus');
  const soleWeapon = character.weaponIds.length === 1;
  const damageBonusFor = (weapon: Weapon) =>
    damageBonuses
      .filter((effect) => damageBonusApplies(effect, weapon, soleWeapon))
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
          modifier: modifier + damageBonusFor(weapon),
          type: weapon.damage.type,
        },
      },
    ];
  });

  return [...wielded, unarmedStrike(featEffects, modifiers.str, bonus + featBonusFor('melee'))];
}

function unarmedStrike(featEffects: Effect[], strength: number, bonus: number): SheetAttack {
  const upgrade = effectOfKind(featEffects, 'unarmedStrikeDamage');
  return {
    name: 'Unarmed Strike',
    attackBonus: strength + bonus,
    damage: upgrade
      ? { count: upgrade.count, die: upgrade.die, modifier: strength, type: 'bludgeoning' }
      : { flat: 1, modifier: strength, type: 'bludgeoning' },
  };
}

const spellSlotsByCasterLevel: number[][] = [
  [],
  [2],
  [3],
  [4, 2],
  [4, 3],
  [4, 3, 2],
  [4, 3, 3],
  [4, 3, 3, 1],
  [4, 3, 3, 2],
  [4, 3, 3, 3, 1],
  [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2, 1],
  [4, 3, 3, 3, 2, 1],
  [4, 3, 3, 3, 2, 1, 1],
  [4, 3, 3, 3, 2, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 2, 1, 1],
];

function casterLevel(taken: ResolvedClass[]): number {
  return taken.reduce((total, { definition, subclass, level }) => {
    const casting = definition.spellcasting ?? subclass?.spellcasting;
    if (!casting) return total;
    if (casting.progression === 'full') return total + level;
    if (casting.progression === 'half') return total + Math.floor(level / 2);
    return total + Math.floor(level / 3);
  }, 0);
}

function spellSlotsFor(taken: ResolvedClass[]): SheetSpellSlot[] {
  const row = spellSlotsByCasterLevel[Math.min(casterLevel(taken), 20)] ?? [];
  return row
    .map((total, index) => ({ level: index + 1, total }))
    .filter((slot) => slot.total > 0);
}

function castingAbilityFor(taken: ResolvedClass[]): Ability | undefined {
  return taken
    .map(({ definition, subclass }) => (definition.spellcasting ?? subclass?.spellcasting)?.ability)
    .find((ability): ability is Ability => ability !== undefined);
}

function spellsFor(character: Character, spells: Spell[]): SheetSpell[] {
  return character.spellbook.knownSpellIds
    .flatMap((id) => {
      const spell = spells.find((entry) => entry.id === id);
      if (!spell) return [];
      const { name, level, school, castingTime, range, duration, concentration, description } =
        spell;
      return [{ name, level, school, castingTime, range, duration, concentration, description }];
    })
    .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
}

function sensesFor(effects: Effect[]): SheetSense[] {
  const ranges = new Map<Sense, number>();
  effectsOfKind(effects, 'grantSense').forEach((effect) => {
    ranges.set(effect.sense, Math.max(ranges.get(effect.sense) ?? 0, effect.range));
  });
  return [...ranges].map(([sense, range]) => ({ name: titleCase(sense), range }));
}

export function derive(character: Character, data: DeriveData = {}): Sheet {
  const { classes = [], weapons = [], tools = [], feats = [], subclasses = [], species = [], subspecies = [], backgrounds = [], spells = [] } = data;

  const level = character.classes.reduce((total, taken) => total + taken.level, 0);
  const bonus = proficiencyBonus(level);

  const chosenSpecies = species.find((entry) => entry.id === character.speciesId);
  const chosenSubspecies = subspecies.find(
    (entry) => entry.id === character.subspeciesId && entry.speciesId === character.speciesId,
  );
  const chosenBackground = backgrounds.find((entry) => entry.id === character.backgroundId);
  const featIds = [
    ...new Set([
      ...(chosenBackground ? [chosenBackground.featId] : []),
      ...character.featIds,
    ]),
  ];
  const featEffects = featIds.flatMap((id) => feats.find((feat) => feat.id === id)?.effects ?? []);

  const abilityScores = abilityScoresFor(character, featEffects);
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

  const taken = resolveClasses(character, classes, subclasses);

  const toolProficiencies = [
    ...new Set([
      ...(chosenBackground && chosenBackground.toolProficiency !== 'None'
        ? [chosenBackground.toolProficiency]
        : []),
      ...taken.flatMap(({ definition }) => definition.toolProficiencies),
      ...(character.toolProficiencies ?? []),
    ]),
  ];
  const sheetTools: SheetTool[] = toolProficiencies.map((name) => {
    const tool = tools.find((entry) => entry.name === name);
    if (!tool) return { name };
    return { name, ability: tool.ability, modifier: abilityModifiers[tool.ability] + bonus };
  });

  const features = featuresFor(taken);
  const hiddenFeatureIds = new Set(character.hiddenFeatureIds ?? []);
  const hiddenTraitIds = new Set(character.hiddenTraitIds ?? []);

  const abilities: SheetAbility[] = features.flatMap(({ feature, classLevel }) =>
    sheetAbilities(feature.effects, classLevel, bonus),
  );

  const traitEffects = [...(chosenSpecies?.traits ?? []), ...(chosenSubspecies?.traits ?? [])].flatMap(
    (trait) => trait.effects,
  );

  const senses = sensesFor([...featEffects, ...traitEffects]);

  const sheetClasses: SheetClass[] = taken.map(({ definition, subclass, level: classLevel }) => ({
    name: definition.name,
    subclass: subclass?.name,
    level: classLevel,
  }));

  const characterFeats: SheetFeat[] = featIds.flatMap((id) => {
    const feat = feats.find((entry) => entry.id === id);
    if (!feat || isAbilityScoreImprovement(feat)) return [];
    return [{ name: feat.name, description: feat.description, category: feat.category, note: featNote(feat, bonus, level) }];
  });

  const initiative =
    abilityModifiers.dex +
    effectsOfKind(featEffects, 'initiativeBonus').reduce(
      (total, effect) => total + initiativeAmount(effect, bonus),
      0,
    );

  const hitPointMaxBonus = effectsOfKind(featEffects, 'hitPointMaxBonus').reduce(
    (total, effect) => total + effect.amountPerLevel * level,
    0,
  );

  const sheetSpells = spellsFor(character, spells);
  const spellSlots = spellSlotsFor(taken);
  const castingAbility = castingAbilityFor(taken) ?? character.spellbook.castingAbility;
  const spellcasting =
    castingAbility !== undefined
      ? {
          ability: castingAbility,
          saveDc: 8 + bonus + abilityModifiers[castingAbility],
          attackBonus: bonus + abilityModifiers[castingAbility],
        }
      : undefined;

  return {
    name: character.name,
    species: chosenSpecies?.name,
    subspecies: chosenSubspecies?.name,
    background: chosenBackground?.name,
    classes: sheetClasses,
    level,
    proficiencyBonus: bonus,
    initiative,
    abilityScores,
    abilityModifiers,
    hitPoints: hitPointsFor(taken, abilityModifiers.con) + hitPointMaxBonus,
    senses,
    skills,
    tools: sheetTools,
    features: features.map((taken) =>
      sheetFeature(taken, hiddenFeatureIds.has(taken.feature.id)),
    ),
    traits: [...(chosenSpecies?.traits ?? []), ...(chosenSubspecies?.traits ?? [])].map(
      ({ id, name, description }) => ({
        id,
        name,
        description,
        hidden: hiddenTraitIds.has(id),
      }),
    ),
    feats: characterFeats,
    abilities: [
      ...abilities,
      ...sheetAbilities(traitEffects, level, bonus),
      ...sheetAbilities(featEffects, level, bonus),
    ],
    attacks: attacksFor(character, weapons, featEffects, abilityModifiers, bonus),
    spells: sheetSpells,
    spellSlots,
    spellcasting,
  };
}
