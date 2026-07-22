import { describe, expect, it } from 'vitest';

import { soldier } from '../data/backgrounds/soldier';
import { exampleFighter } from '../data/characters/example-fighter';
import { veraQuickblade } from '../data/characters/vera-quickblade';
import { champion } from '../data/classes/fighter/champion';
import { fighter } from '../data/classes/fighter/fighter';
import { feats } from '../data/feats';
import { weapons } from '../data/items';
import { aasimar } from '../data/species/aasimar';
import { elf, elfSubspecies, woodElf } from '../data/species/elf';
import { human } from '../data/species/human';
import { spells } from '../data/spells';
import type { Class } from '../types/class';
import { abilityModifier, derive, grantedSpellIds, proficiencyBonus } from './derive';

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
  const sheet = derive(exampleFighter, { classes: [fighter] });

  it('reports the class and level', () => {
    expect(sheet.level).toBe(1);
    expect(sheet.classes).toEqual([{ name: 'Fighter', level: 1 }]);
    expect(sheet.proficiencyBonus).toBe(2);
  });

  it('computes hit points from the hit die and Constitution', () => {
    expect(sheet.hitPoints).toBe(12);
  });

  it('raises the hit point maximum by twice the character level for Tough and notes it', () => {
    const tough = derive(
      { ...exampleFighter, featIds: ['tough'] },
      { classes: [fighter], weapons, feats },
    );
    expect(tough.hitPoints).toBe(14);
    expect(tough.feats.find((feat) => feat.name === 'Tough')?.note).toBe(
      'Already included in your totals: +2 Hit Points.',
    );

    const tough5 = derive(
      { ...exampleFighter, classes: [{ classId: 'fighter', level: 5 }], featIds: ['tough'] },
      { classes: [fighter], weapons, feats },
    );
    expect(tough5.hitPoints).toBe(54);
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

  it('keeps ability-, feat-, and subclass-granting features on the sheet', () => {
    const level3 = derive(
      { ...exampleFighter, classes: [{ classId: 'fighter', level: 3 }] },
      { classes: [fighter] },
    );

    expect(level3.features.map((feature) => feature.name)).toEqual([
      'Fighting Style',
      'Second Wind',
      'Weapon Mastery',
      'Action Surge',
      'Tactical Mind',
      'Fighter Subclass',
    ]);
    expect(level3.abilities.map((ability) => ability.name)).toEqual(['Second Wind', 'Action Surge']);
  });

  it('folds the chosen subclass features into the sheet', () => {
    const champion3 = derive(
      { ...exampleFighter, classes: [{ classId: 'fighter', subclassId: 'champion', level: 3 }] },
      { classes: [fighter], subclasses: [champion] },
    );

    expect(champion3.classes[0]?.subclass).toBe('Champion');
    expect(champion3.features.map((feature) => feature.name)).toEqual([
      'Fighting Style',
      'Second Wind',
      'Weapon Mastery',
      'Action Surge',
      'Tactical Mind',
      'Fighter Subclass',
      'Improved Critical',
      'Remarkable Athlete',
    ]);
  });

  describe('hiding', () => {
    it('marks the features and traits the character has hidden', () => {
      const withHidden = derive(
        {
          ...exampleFighter,
          hiddenFeatureIds: ['fighter-second-wind'],
          hiddenTraitIds: ['human-skillful'],
        },
        { classes: [fighter], species: [human] },
      );

      expect(
        withHidden.features.filter((feature) => feature.hidden).map((feature) => feature.id),
      ).toEqual(['fighter-second-wind']);
      expect(
        withHidden.traits.filter((trait) => trait.hidden).map((trait) => trait.id),
      ).toEqual(['human-skillful']);
    });

    it('hides nothing by default', () => {
      expect(sheet.features.some((feature) => feature.hidden)).toBe(false);
    });
  });

  describe('subspecies', () => {
    const data = { classes: [fighter], species: [elf], subspecies: elfSubspecies };

    it('folds the chosen subspecies traits and name into the sheet', () => {
      const chosen = derive({ ...veraQuickblade, subspeciesId: woodElf.id }, data);

      expect(chosen.subspecies).toBe('Wood Elf');
      const traitIds = chosen.traits.map((trait) => trait.id);
      expect(traitIds).toContain('elf-keen-senses');
      expect(traitIds).toContain('wood-elf-magic');
    });

    it('omits subspecies traits until one is chosen', () => {
      const unchosen = derive(veraQuickblade, data);

      expect(unchosen.subspecies).toBeUndefined();
      expect(unchosen.traits.some((trait) => trait.id === 'wood-elf-magic')).toBe(false);
    });
  });

  it('shows a feature it replaces until the upgrade is gained', () => {
    const withClasses = (level: number) => ({
      ...exampleFighter,
      classes: [{ classId: 'fighter', subclassId: 'champion', level }],
    });
    const names = (level: number) =>
      derive(withClasses(level), { classes: [fighter], subclasses: [champion] }).features.map(
        (feature) => feature.name,
      );

    expect(names(3)).toContain('Improved Critical');
    expect(names(3)).not.toContain('Superior Critical');

    expect(names(15)).toContain('Superior Critical');
    expect(names(15)).not.toContain('Improved Critical');
  });

  it('grants an Unarmed Strike even when no weapon content is supplied', () => {
    expect(sheet.attacks).toEqual([
      {
        name: 'Unarmed Strike',
        attackBonus: 5,
        damage: { flat: 1, modifier: 3, type: 'bludgeoning' },
      },
    ]);
  });

  describe('attacks', () => {
    const vera = derive(veraQuickblade, { classes: [fighter], weapons, feats });

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

    it('keeps the Unarmed Strike on Strength and clear of ranged-only bonuses', () => {
      const unarmed = vera.attacks.find((attack) => attack.name === 'Unarmed Strike');
      expect(unarmed).toEqual({
        name: 'Unarmed Strike',
        attackBonus: 2,
        damage: { flat: 1, modifier: 0, type: 'bludgeoning' },
      });
    });

    it('upgrades the Unarmed Strike damage die with Tavern Brawler and notes it', () => {
      const brawler = derive(
        { ...exampleFighter, featIds: ['tavern-brawler'] },
        { classes: [fighter], weapons, feats },
      );
      const unarmed = brawler.attacks.find((attack) => attack.name === 'Unarmed Strike');
      expect(unarmed).toEqual({
        name: 'Unarmed Strike',
        attackBonus: 5,
        damage: { count: 1, die: 'd4', modifier: 3, type: 'bludgeoning' },
      });
      expect(brawler.feats.find((feat) => feat.name === 'Tavern Brawler')?.note).toBe(
        'Already included in your totals: 1d4 Unarmed Strike damage.',
      );
    });
  });

  describe('initiative', () => {
    it('is the dexterity modifier without a bonus', () => {
      expect(derive(exampleFighter, { classes: [fighter] }).initiative).toBe(1);
    });

    it('adds the proficiency bonus for Alert and notes it on the feat', () => {
      const alert = derive(
        { ...exampleFighter, featIds: ['alert'] },
        { classes: [fighter], weapons, feats },
      );
      expect(alert.initiative).toBe(3);
      expect(alert.feats.find((feat) => feat.name === 'Alert')?.note).toBe(
        'Already included in your totals: +2 to Initiative.',
      );
    });
  });

  describe('feat abilities', () => {
    it('grants Luck Points from Lucky with uses equal to the proficiency bonus', () => {
      const lucky = derive(
        { ...exampleFighter, featIds: ['lucky'] },
        { classes: [fighter], weapons, feats },
      );
      expect(lucky.abilities.find((ability) => ability.name === 'Luck Points')).toEqual({
        name: 'Luck Points',
        description:
          'Spend a Luck Point to give yourself Advantage on a d20 Test, or to impose Disadvantage on an attack roll made against you.',
        activation: { type: 'free' },
        uses: { count: 2, recharge: [{ on: 'long-rest', amount: 'all' }] },
      });
    });

    it('scales Luck Points with the proficiency bonus at higher levels', () => {
      const lucky = derive(
        { ...exampleFighter, classes: [{ classId: 'fighter', level: 5 }], featIds: ['lucky'] },
        { classes: [fighter], weapons, feats },
      );
      expect(
        lucky.abilities.find((ability) => ability.name === 'Luck Points')?.uses?.count,
      ).toBe(3);
    });
  });

  describe('trait abilities', () => {
    const aasimarChar = { ...exampleFighter, speciesId: 'aasimar' };

    it('surfaces a species trait ability with its activation and uses', () => {
      const sheet = derive(aasimarChar, { classes: [fighter], species: [aasimar] });
      expect(sheet.abilities.find((ability) => ability.name === 'Healing Hands')).toEqual({
        name: 'Healing Hands',
        description:
          'Touch a creature and roll a number of d4s equal to your Proficiency Bonus; it regains Hit Points equal to the total.',
        activation: { type: 'action' },
        uses: { count: 1, recharge: [{ on: 'long-rest', amount: 'all' }] },
      });
    });

    it('withholds a trait ability until the character reaches its level', () => {
      const level1 = derive(aasimarChar, { classes: [fighter], species: [aasimar] });
      expect(level1.abilities.some((ability) => ability.name === 'Celestial Revelation')).toBe(
        false,
      );

      const level3 = derive(
        { ...aasimarChar, classes: [{ classId: 'fighter', level: 3 }] },
        { classes: [fighter], species: [aasimar] },
      );
      expect(level3.abilities.find((ability) => ability.name === 'Celestial Revelation')?.uses).toEqual({
        count: 1,
        recharge: [{ on: 'long-rest', amount: 'all' }],
      });
    });
  });

  describe('feats', () => {
    const vera = derive(veraQuickblade, { classes: [fighter], weapons, feats });

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
        { classes: [fighter], weapons, feats },
      );
      expect(boosted.feats).toEqual([]);
      expect(boosted.abilityScores.str).toBe(18);
    });
  });

  describe('species and background', () => {
    const resolved = derive(exampleFighter, {
      classes: [fighter],
      weapons,
      feats,
      species: [human],
      backgrounds: [soldier],
    });

    it('names the resolved species and background', () => {
      expect(resolved.species).toBe('Human');
      expect(resolved.background).toBe('Soldier');
    });

    it('leaves them off when the ids do not resolve', () => {
      expect(sheet.species).toBeUndefined();
      expect(sheet.background).toBeUndefined();
      expect(sheet.traits).toEqual([]);
    });

    it('surfaces the species traits', () => {
      expect(resolved.traits.map((trait) => trait.name)).toEqual([
        'Resourceful',
        'Skillful',
        'Versatile',
      ]);
    });

    it('marks the background skills proficient alongside the chosen ones', () => {
      const scholar = derive(
        { ...exampleFighter, skillProficiencies: ['history'] },
        { classes: [fighter], weapons, feats, species: [human], backgrounds: [soldier] },
      );
      const proficient = scholar.skills
        .filter((entry) => entry.proficient)
        .map((entry) => entry.skill);
      expect(proficient.sort()).toEqual(['athletics', 'history', 'intimidation']);
    });

    it('folds the background origin feat in once, even when also taken directly', () => {
      expect(resolved.feats.map((feat) => feat.name)).toEqual(['Savage Attacker']);

      const doubled = derive(
        { ...exampleFighter, featIds: ['savage-attacker'] },
        { classes: [fighter], weapons, feats, species: [human], backgrounds: [soldier] },
      );
      expect(doubled.feats.map((feat) => feat.name)).toEqual(['Savage Attacker']);
    });
  });

  describe('ability score increases', () => {
    it('folds chosen increases into the score and its modifier', () => {
      const boosted = derive(
        { ...exampleFighter, abilityScoreIncreases: { str: 2 } },
        { classes: [fighter] },
      );
      expect(boosted.abilityScores.str).toBe(18);
      expect(boosted.abilityModifiers.str).toBe(4);
    });

    it('spreads a split increase across two abilities', () => {
      const boosted = derive(
        { ...exampleFighter, abilityScoreIncreases: { str: 1, con: 1 } },
        { classes: [fighter] },
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
        { classes: [fighter] },
      );
      expect(capped.abilityScores.str).toBe(20);
    });
  });

  describe('level scaling', () => {
    const atLevel = (level: number) =>
      derive({ ...exampleFighter, classes: [{ classId: 'fighter', level }] }, { classes: [fighter] });

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
        { classes: [fighter] },
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

describe('spellbook', () => {
  const data = { classes: [fighter], spells };

  it('resolves known spells, sorted by level then name', () => {
    const caster = derive(
      {
        ...veraQuickblade,
        spellbook: { castingAbility: 'int', knownSpellIds: ['detect-magic', 'prestidigitation'] },
      },
      data,
    );

    expect(caster.spells.map((spell) => spell.name)).toEqual([
      'Prestidigitation',
      'Detect Magic',
    ]);
    expect(caster.spells[0]).toMatchObject({
      name: 'Prestidigitation',
      level: 0,
      school: 'transmutation',
    });
  });

  it('derives the save DC and attack bonus from the casting ability', () => {
    const caster = derive(
      { ...veraQuickblade, spellbook: { castingAbility: 'int', knownSpellIds: ['prestidigitation'] } },
      data,
    );

    // Vera has INT 12 (+1) at level 3 (proficiency +2).
    expect(caster.spellcasting).toEqual({ ability: 'int', saveDc: 11, attackBonus: 3 });
  });

  it('skips spell ids with no matching content', () => {
    const caster = derive(
      { ...veraQuickblade, spellbook: { knownSpellIds: ['prestidigitation', 'not-a-spell'] } },
      data,
    );

    expect(caster.spells.map((spell) => spell.name)).toEqual(['Prestidigitation']);
  });

  it('leaves an empty spellbook without spells or spellcasting', () => {
    const nonCaster = derive(exampleFighter, data);

    expect(nonCaster.spells).toEqual([]);
    expect(nonCaster.spellcasting).toBeUndefined();
  });
});

describe('spell slots', () => {
  const fullCaster: Class = {
    ...fighter,
    id: 'wizard',
    spellcasting: { ability: 'int', progression: 'full' },
  };
  const halfCaster: Class = {
    ...fighter,
    id: 'paladin',
    spellcasting: { ability: 'cha', progression: 'half' },
  };
  const thirdCaster: Class = {
    ...fighter,
    id: 'trickster',
    spellcasting: { ability: 'int', progression: 'third' },
  };

  function slotsAt(definition: Class, level: number) {
    return derive(
      { ...exampleFighter, classes: [{ classId: definition.id, level }] },
      { classes: [definition] },
    ).spellSlots;
  }

  it('gives a full caster the standard slots for their level', () => {
    expect(slotsAt(fullCaster, 1)).toEqual([{ level: 1, total: 2 }]);
    expect(slotsAt(fullCaster, 5)).toEqual([
      { level: 1, total: 4 },
      { level: 2, total: 3 },
      { level: 3, total: 2 },
    ]);
  });

  it('advances a half caster at half their level, rounded down', () => {
    expect(slotsAt(halfCaster, 1)).toEqual([]);
    expect(slotsAt(halfCaster, 5)).toEqual([{ level: 1, total: 3 }]);
  });

  it('advances a third caster at a third of their level, rounded down', () => {
    expect(slotsAt(thirdCaster, 2)).toEqual([]);
    expect(slotsAt(thirdCaster, 3)).toEqual([{ level: 1, total: 2 }]);
  });

  it('gives a non-caster no slots', () => {
    expect(slotsAt(fighter, 5)).toEqual([]);
  });

  it('takes the casting ability from the spellcasting class', () => {
    const sheet = derive(
      { ...exampleFighter, classes: [{ classId: 'wizard', level: 3 }] },
      { classes: [fullCaster] },
    );

    expect(sheet.spellcasting?.ability).toBe('int');
  });
});

describe('grantedSpellIds', () => {
  it('grants only the cantrip at level 1', () => {
    expect(grantedSpellIds(woodElf.traits, 1)).toEqual(['druidcraft']);
  });

  it('adds the level-3 spell at character level 3', () => {
    expect(grantedSpellIds(woodElf.traits, 3)).toEqual(['druidcraft', 'longstrider']);
  });

  it('adds the level-5 spell at character level 5', () => {
    expect(grantedSpellIds(woodElf.traits, 5)).toEqual([
      'druidcraft',
      'longstrider',
      'pass-without-trace',
    ]);
  });

  it('is empty for traits that grant no spells', () => {
    expect(grantedSpellIds(human.traits, 20)).toEqual([]);
  });
});
