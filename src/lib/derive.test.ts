import { describe, expect, it } from 'vitest';

import { exampleFighter } from '../data/characters/example-fighter';
import { fighter } from '../data/classes/fighter/fighter';
import { abilityModifier, derive, proficiencyBonus } from './derive';

describe('abilityModifier', () => {
  it('floors toward negative for odd and low scores', () => {
    expect(abilityModifier(16)).toBe(3);
    expect(abilityModifier(15)).toBe(2);
    expect(abilityModifier(10)).toBe(0);
    expect(abilityModifier(8)).toBe(-1);
    expect(abilityModifier(1)).toBe(-5);
  });
});

describe('proficiencyBonus', () => {
  it('steps every four levels', () => {
    expect(proficiencyBonus(1)).toBe(2);
    expect(proficiencyBonus(4)).toBe(2);
    expect(proficiencyBonus(5)).toBe(3);
    expect(proficiencyBonus(20)).toBe(6);
  });
});

describe('derive', () => {
  const sheet = derive(exampleFighter, [fighter]);

  it('reports the class and level', () => {
    expect(sheet.level).toBe(1);
    expect(sheet.classes).toEqual([{ name: 'Fighter', level: 1 }]);
    expect(sheet.proficiencyBonus).toBe(2);
  });

  it('computes hit points from the hit die and Constitution', () => {
    expect(sheet.hitPoints).toBe(12);
  });

  it('adds proficiency only to proficient skills', () => {
    const athletics = sheet.skills.find((entry) => entry.skill === 'athletics');
    const acrobatics = sheet.skills.find((entry) => entry.skill === 'acrobatics');
    const intimidation = sheet.skills.find((entry) => entry.skill === 'intimidation');

    expect(athletics).toMatchObject({ ability: 'str', proficient: true, modifier: 5 });
    expect(acrobatics).toMatchObject({ ability: 'dex', proficient: false, modifier: 1 });
    expect(intimidation).toMatchObject({ ability: 'cha', proficient: true, modifier: 1 });
  });

  it('covers every skill', () => {
    expect(sheet.skills).toHaveLength(18);
  });

  it('includes only features at or below the character level', () => {
    expect(sheet.features.map((feature) => feature.name)).toEqual([
      'Fighting Style',
      'Second Wind',
      'Weapon Mastery',
    ]);
  });

  it('collects granted abilities with their activation and uses', () => {
    expect(sheet.abilities).toEqual([
      {
        name: 'Second Wind',
        description: 'Regain Hit Points equal to 1d10 plus your Fighter level.',
        activation: { type: 'bonus-action' },
        uses: {
          count: 2,
          recharge: [
            { on: 'short-rest', amount: 1 },
            { on: 'long-rest', amount: 'all' },
          ],
        },
      },
    ]);
  });
});
