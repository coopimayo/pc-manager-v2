import { describe, expect, it } from 'vitest';

import { exampleFighter } from '../data/characters/example-fighter';
import { veraQuickblade } from '../data/characters/vera-quickblade';
import { fighter } from '../data/classes/fighter/fighter';
import { feats } from '../data/feats';
import { weapons } from '../data/items';
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
    expect(sheet.features.map((feature) => feature.name)).toEqual(['Weapon Mastery']);
  });

  it('omits features that surface as an ability or a granted feat instead', () => {
    const level3 = derive({ ...exampleFighter, classes: [{ classId: 'fighter', level: 3 }] }, [
      fighter,
    ]);

    expect(level3.features.map((feature) => feature.name)).toEqual([
      'Weapon Mastery',
      'Tactical Mind',
      'Fighter Subclass',
    ]);
    expect(level3.features.map((feature) => feature.name)).not.toContain('Fighting Style');
    expect(level3.abilities.map((ability) => ability.name)).toEqual(['Second Wind', 'Action Surge']);
  });

  it('leaves attacks empty when no weapon content is supplied', () => {
    expect(sheet.attacks).toEqual([]);
  });

  describe('attacks', () => {
    const vera = derive(veraQuickblade, [fighter], weapons, feats);

    it('adds a matching attack-roll bonus to the to-hit but not the damage', () => {
      const longbow = vera.attacks.find((attack) => attack.name === 'Longbow');
      expect(longbow).toEqual({
        name: 'Longbow',
        attackBonus: 7,
        damage: { count: 1, die: 'd8', modifier: 3, type: 'piercing' },
      });
    });

    it('uses the higher ability for a finesse weapon and ignores a ranged-only bonus', () => {
      const shortsword = vera.attacks.find((attack) => attack.name === 'Shortsword');
      expect(shortsword).toEqual({
        name: 'Shortsword',
        attackBonus: 5,
        damage: { count: 1, die: 'd6', modifier: 3, type: 'piercing' },
      });
    });
  });

  describe('feats', () => {
    const vera = derive(veraQuickblade, [fighter], weapons, feats);

    it('lists the character feats with their category', () => {
      expect(vera.feats).toEqual([
        {
          name: 'Archery',
          description: 'You gain a +2 bonus to attack rolls you make with Ranged weapons.',
          category: 'fighting-style',
          note: 'Already included in your totals: +2 to ranged attack rolls.',
        },
      ]);
    });

    it('is empty when no feat content is supplied', () => {
      expect(sheet.feats).toEqual([]);
    });

    it('omits the Ability Score Improvement feat but keeps its increase', () => {
      const boosted = derive(
        {
          ...exampleFighter,
          featIds: ['ability-score-improvement'],
          abilityScoreIncreases: { str: 2 },
        },
        [fighter],
        weapons,
        feats,
      );
      expect(boosted.feats).toEqual([]);
      expect(boosted.abilityScores.str).toBe(18);
    });
  });

  describe('ability score increases', () => {
    it('folds chosen increases into the score and its modifier', () => {
      const boosted = derive({ ...exampleFighter, abilityScoreIncreases: { str: 2 } }, [fighter]);
      expect(boosted.abilityScores.str).toBe(18);
      expect(boosted.abilityModifiers.str).toBe(4);
    });

    it('spreads a split increase across two abilities', () => {
      const boosted = derive(
        { ...exampleFighter, abilityScoreIncreases: { str: 1, con: 1 } },
        [fighter],
      );
      expect(boosted.abilityScores.str).toBe(17);
      expect(boosted.abilityScores.con).toBe(16);
    });

    it('caps a boosted score at 20', () => {
      const capped = derive(
        {
          ...exampleFighter,
          abilityScores: { ...exampleFighter.abilityScores, str: 19 },
          abilityScoreIncreases: { str: 2 },
        },
        [fighter],
      );
      expect(capped.abilityScores.str).toBe(20);
    });
  });

  describe('level scaling', () => {
    const atLevel = (level: number) =>
      derive({ ...exampleFighter, classes: [{ classId: 'fighter', level }] }, [fighter]);

    const secondWindUses = (level: number) =>
      atLevel(level).abilities.find((ability) => ability.name === 'Second Wind')?.uses?.count;

    const weaponMastery = (level: number) =>
      atLevel(level).features.find((feature) => feature.name === 'Weapon Mastery')?.detail;

    it('scales Second Wind uses against the Fighter level', () => {
      expect(secondWindUses(1)).toBe(2);
      expect(secondWindUses(3)).toBe(2);
      expect(secondWindUses(4)).toBe(3);
      expect(secondWindUses(10)).toBe(4);
      expect(secondWindUses(20)).toBe(4);
    });

    it('scales the Weapon Mastery weapon count against the Fighter level', () => {
      expect(weaponMastery(1)).toBe('3 weapons');
      expect(weaponMastery(4)).toBe('4 weapons');
      expect(weaponMastery(10)).toBe('5 weapons');
      expect(weaponMastery(16)).toBe('6 weapons');
    });

    it('scales against the class level, not total character level, when multiclassed', () => {
      const multiclass = derive(
        {
          ...exampleFighter,
          classes: [
            { classId: 'fighter', level: 1 },
            { classId: 'wizard', level: 9 },
          ],
        },
        [fighter],
      );
      const secondWind = multiclass.abilities.find((ability) => ability.name === 'Second Wind');
      expect(secondWind?.uses?.count).toBe(2);
    });
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
