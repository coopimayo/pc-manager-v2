import type { Feat } from '../../types';

export const archery: Feat = {
  id: 'archery',
  name: 'Archery',
  description: 'You gain a +2 bonus to attack rolls you make with Ranged weapons.',
  category: 'fighting-style',
  prerequisite: 'Fighting Style Feature',
  effects: [{ kind: 'attackRollBonus', amount: 2, attackType: 'ranged' }],
};

export const blindFighting: Feat = {
  id: 'blind-fighting',
  name: 'Blind Fighting',
  description:
    "You have Blindsight with a range of 10 feet. Within that range, you can see anything that isn't behind Total Cover even if you have the Blinded condition or are in Darkness, and you can see a creature that has the Invisible condition.",
  category: 'fighting-style',
  prerequisite: 'Fighting Style Feature',
  effects: [{ kind: 'grantSense', sense: 'blindsight', range: 10 }],
};

export const defense: Feat = {
  id: 'defense',
  name: 'Defense',
  description:
    'While you are wearing Light, Medium, or Heavy armor, you gain a +1 bonus to Armor Class.',
  category: 'fighting-style',
  prerequisite: 'Fighting Style Feature',
  effects: [],
};

export const druidicWarrior: Feat = {
  id: 'druidic-warrior',
  name: 'Druidic Warrior',
  description:
    'You learn two Druid cantrips of your choice. They count as Ranger spells for you, and Wisdom is your spellcasting ability for them.',
  category: 'fighting-style',
  prerequisite: 'Fighting Style Feature',
  effects: [],
};

export const dueling: Feat = {
  id: 'dueling',
  name: 'Dueling',
  description:
    'When you are wielding a Melee weapon in one hand and no other weapons, you gain a +2 bonus to damage rolls with that weapon.',
  category: 'fighting-style',
  prerequisite: 'Fighting Style Feature',
  effects: [
    {
      kind: 'damageRollBonus',
      amount: 2,
      attackType: 'melee',
      withoutProperty: 'two-handed',
      soleWeapon: true,
    },
  ],
};

export const greatWeaponFighting: Feat = {
  id: 'great-weapon-fighting',
  name: 'Great Weapon Fighting',
  description:
    'When you roll damage for an attack you make with a Melee weapon that you are wielding with two hands, you can treat any 1 or 2 on a damage die as a 3. The weapon must have the Two-Handed or Versatile property.',
  category: 'fighting-style',
  prerequisite: 'Fighting Style Feature',
  effects: [],
};

export const interception: Feat = {
  id: 'interception',
  name: 'Interception',
  description:
    'When a creature you can see hits a target within 5 feet of you with an attack roll, you can take a Reaction to reduce the damage the target takes by 1d10 plus your Proficiency Bonus. You must be wielding a Shield or a Simple or Martial weapon.',
  category: 'fighting-style',
  prerequisite: 'Fighting Style Feature',
  effects: [
    {
      kind: 'grantAbility',
      name: 'Interception',
      description:
        'Reduce the damage the target takes by 1d10 plus your Proficiency Bonus, to a minimum of 0 damage. You must be wielding a Shield or a Simple or Martial weapon.',
      activation: {
        type: 'reaction',
        trigger: 'A creature you can see hits a target within 5 feet of you with an attack roll.',
      },
    },
  ],
};

export const protection: Feat = {
  id: 'protection',
  name: 'Protection',
  description:
    'When a creature you can see attacks a target other than you that is within 5 feet of you, you can take a Reaction to impose Disadvantage on the attack roll. You must be wielding a Shield.',
  category: 'fighting-style',
  prerequisite: 'Fighting Style Feature',
  effects: [
    {
      kind: 'grantAbility',
      name: 'Protection',
      description: 'Impose Disadvantage on the attack roll. You must be wielding a Shield.',
      activation: {
        type: 'reaction',
        trigger:
          'A creature you can see attacks a target other than you that is within 5 feet of you.',
      },
    },
  ],
};

export const thrownWeaponFighting: Feat = {
  id: 'thrown-weapon-fighting',
  name: 'Thrown Weapon Fighting',
  description:
    'You can draw a weapon that has the Thrown property as part of the attack you make with it, and you gain a +2 bonus to damage rolls with such weapons.',
  category: 'fighting-style',
  prerequisite: 'Fighting Style Feature',
  effects: [{ kind: 'damageRollBonus', amount: 2, weaponProperty: 'thrown' }],
};

export const twoWeaponFighting: Feat = {
  id: 'two-weapon-fighting',
  name: 'Two-Weapon Fighting',
  description:
    'When you engage in Two-Weapon Fighting, you can add your ability modifier to the damage of the second attack.',
  category: 'fighting-style',
  prerequisite: 'Fighting Style Feature',
  effects: [],
};

export const unarmedFighting: Feat = {
  id: 'unarmed-fighting',
  name: 'Unarmed Fighting',
  description:
    'Your Unarmed Strikes can deal 1d6 Bludgeoning damage (1d8 if you have no weapons or a Shield in hand), and you can deal 1d4 Bludgeoning damage to a creature you have Grappled at the start of each of your turns.',
  category: 'fighting-style',
  prerequisite: 'Fighting Style Feature',
  effects: [{ kind: 'unarmedStrikeDamage', count: 1, die: 'd6' }],
};

export const fightingStyleFeats: Feat[] = [
  archery,
  blindFighting,
  defense,
  druidicWarrior,
  dueling,
  greatWeaponFighting,
  interception,
  protection,
  thrownWeaponFighting,
  twoWeaponFighting,
  unarmedFighting,
];
