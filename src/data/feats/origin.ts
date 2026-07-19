import type { Feat } from '../../types';

export const alert: Feat = {
  id: 'alert',
  name: 'Alert',
  description:
    'You gain a bonus to Initiative equal to your Proficiency Bonus, and you can swap Initiative with a willing ally.',
  category: 'origin',
  effects: [{ kind: 'initiativeBonus', amount: 'proficiencyBonus' }],
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
  effects: [],
};

export const originFeats: Feat[] = [alert, lucky, musician, savageAttacker, skilled, tavernBrawler, tough];
