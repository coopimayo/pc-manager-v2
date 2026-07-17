import type { Ability, Character, Die, Effect, Skill } from '../types';
import type { Class, ClassFeature } from '../types/class';
import type { Sheet, SheetAbility, SheetClass, SheetSkill } from '../types/sheet';
import { skillAbilities } from './skill-abilities';

type GrantAbility = Extract<Effect, { kind: 'grantAbility' }>;

export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function proficiencyBonus(level: number): number {
  return 2 + Math.floor((level - 1) / 4);
}

function dieSize(die: Die): number {
  return Number(die.slice(1));
}

function featuresFor(character: Character, classes: Class[]): ClassFeature[] {
  return character.classes.flatMap((taken) => {
    const found = classes.find((entry) => entry.id === taken.classId);
    return found ? found.features.filter((feature) => feature.level <= taken.level) : [];
  });
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

export function derive(character: Character, classes: Class[]): Sheet {
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

  const abilities: SheetAbility[] = features
    .flatMap((feature) => feature.effects)
    .filter((effect): effect is GrantAbility => effect.kind === 'grantAbility')
    .map(({ name, description, activation, uses }) => ({ name, description, activation, uses }));

  const taken: SheetClass[] = character.classes.flatMap((entry) => {
    const found = classes.find((cls) => cls.id === entry.classId);
    return found ? [{ name: found.name, level: entry.level }] : [];
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
    features,
    abilities,
  };
}
