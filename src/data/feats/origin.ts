import type { Feat } from '../../types';

export const alert: Feat = {
  id: 'alert',
  name: 'Alert',
  description:
    'You gain a bonus to Initiative equal to your Proficiency Bonus, and you can swap Initiative with a willing ally.',
  category: 'origin',
  effects: [{ kind: 'initiativeBonus', amount: 'proficiencyBonus' }],
};

export const crafter: Feat = {
  id: 'crafter',
  name: 'Crafter',
  description:
    "You gain proficiency with three Artisan's Tools of your choice, buy nonmagical items at a 20 percent discount, and can craft a piece of simple gear when you finish a Long Rest.",
  category: 'origin',
  effects: [],
};

export const healer: Feat = {
  id: 'healer',
  name: 'Healer',
  description:
    "You can patch up allies with a Healer's Kit, and whenever you roll a die to restore Hit Points you can reroll 1s.",
  category: 'origin',
  effects: [
    {
      kind: 'grantAbility',
      name: 'Battle Medic',
      description:
        "As a Utilize action, expend one use of a Healer's Kit to tend to a creature within 5 feet. It can expend one of its Hit Dice; roll that die, and it regains Hit Points equal to the roll plus your Proficiency Bonus.",
      activation: { type: 'action' },
    },
  ],
};

export const lucky: Feat = {
  id: 'lucky',
  name: 'Lucky',
  description:
    'You have Luck Points equal to your Proficiency Bonus to gain Advantage on a roll or impose Disadvantage on an attack against you.',
  category: 'origin',
  effects: [
    {
      kind: 'grantAbility',
      name: 'Luck Points',
      description:
        'Spend a Luck Point to give yourself Advantage on a d20 Test, or to impose Disadvantage on an attack roll made against you.',
      activation: { type: 'free' },
      uses: { count: 'proficiencyBonus', recharge: [{ on: 'long-rest', amount: 'all' }] },
    },
  ],
};

const magicInitiate = (list: 'Cleric' | 'Druid' | 'Wizard'): Feat => ({
  id: `magic-initiate-${list.toLowerCase()}`,
  name: `Magic Initiate (${list})`,
  description: `You learn two cantrips and one level 1 spell from the ${list} spell list, and once per Long Rest you can cast that spell without a spell slot.`,
  category: 'origin',
  effects: [],
});

export const magicInitiateCleric = magicInitiate('Cleric');
export const magicInitiateDruid = magicInitiate('Druid');
export const magicInitiateWizard = magicInitiate('Wizard');

export const musician: Feat = {
  id: 'musician',
  name: 'Musician',
  description:
    'You gain proficiency with three Musical Instruments, and after a Short or Long Rest you can give Heroic Inspiration to allies equal to your Proficiency Bonus.',
  category: 'origin',
  effects: [],
};

export const savageAttacker: Feat = {
  id: 'savage-attacker',
  name: 'Savage Attacker',
  description:
    'Once per turn when you hit with a weapon, you can roll its damage dice twice and use either roll.',
  category: 'origin',
  effects: [],
};

export const skilled: Feat = {
  id: 'skilled',
  name: 'Skilled',
  description: 'You gain proficiency in any combination of three skills or tools of your choice.',
  category: 'origin',
  effects: [{ kind: 'skillProficiencyChoice', count: 3 }],
};

export const tavernBrawler: Feat = {
  id: 'tavern-brawler',
  name: 'Tavern Brawler',
  description:
    'Your Unarmed Strikes deal 1d4 + Strength modifier damage, you can reroll 1s on their damage, and once per turn you can push a target 5 feet on a hit.',
  category: 'origin',
  effects: [{ kind: 'unarmedStrikeDamage', count: 1, die: 'd4' }],
};

export const tough: Feat = {
  id: 'tough',
  name: 'Tough',
  description: 'Your Hit Point maximum increases by an amount equal to twice your character level.',
  category: 'origin',
  effects: [{ kind: 'hitPointMaxBonus', amountPerLevel: 2 }],
};

export const originFeats: Feat[] = [
  alert,
  crafter,
  healer,
  lucky,
  magicInitiateCleric,
  magicInitiateDruid,
  magicInitiateWizard,
  musician,
  savageAttacker,
  skilled,
  tavernBrawler,
  tough,
];
