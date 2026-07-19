import type { Weapon } from '../../types/item';

export const dagger: Weapon = {
  id: 'dagger',
  name: 'Dagger',
  cost: { amount: 2, unit: 'gp' },
  weight: 1,
  category: 'simple',
  attackType: 'melee',
  damage: { count: 1, die: 'd4', type: 'piercing' },
  properties: ['finesse', 'light', 'thrown'],
  mastery: 'nick',
  range: { normal: 20, long: 60 },
};

export const sickle: Weapon = {
  id: 'sickle',
  name: 'Sickle',
  cost: { amount: 1, unit: 'gp' },
  weight: 2,
  category: 'simple',
  attackType: 'melee',
  damage: { count: 1, die: 'd4', type: 'slashing' },
  properties: ['light'],
  mastery: 'nick',
};

export const lightCrossbow: Weapon = {
  id: 'light-crossbow',
  name: 'Light Crossbow',
  cost: { amount: 25, unit: 'gp' },
  weight: 5,
  category: 'simple',
  attackType: 'ranged',
  damage: { count: 1, die: 'd8', type: 'piercing' },
  properties: ['ammunition', 'loading', 'two-handed'],
  mastery: 'slow',
  range: { normal: 80, long: 320 },
};

export const greatsword: Weapon = {
  id: 'greatsword',
  name: 'Greatsword',
  cost: { amount: 50, unit: 'gp' },
  weight: 6,
  category: 'martial',
  attackType: 'melee',
  damage: { count: 2, die: 'd6', type: 'slashing' },
  properties: ['heavy', 'two-handed'],
  mastery: 'graze',
};

export const flail: Weapon = {
  id: 'flail',
  name: 'Flail',
  cost: { amount: 10, unit: 'gp' },
  weight: 2,
  category: 'martial',
  attackType: 'melee',
  damage: { count: 1, die: 'd8', type: 'bludgeoning' },
  properties: [],
  mastery: 'sap',
};

export const javelin: Weapon = {
  id: 'javelin',
  name: 'Javelin',
  cost: { amount: 5, unit: 'sp' },
  weight: 2,
  category: 'simple',
  attackType: 'melee',
  damage: { count: 1, die: 'd6', type: 'piercing' },
  properties: ['thrown'],
  mastery: 'slow',
  range: { normal: 30, long: 120 },
};

export const spear: Weapon = {
  id: 'spear',
  name: 'Spear',
  cost: { amount: 1, unit: 'gp' },
  weight: 3,
  category: 'simple',
  attackType: 'melee',
  damage: { count: 1, die: 'd6', type: 'piercing' },
  properties: ['thrown', 'versatile'],
  mastery: 'sap',
  range: { normal: 20, long: 60 },
};

export const quarterstaff: Weapon = {
  id: 'quarterstaff',
  name: 'Quarterstaff',
  cost: { amount: 2, unit: 'sp' },
  weight: 4,
  category: 'simple',
  attackType: 'melee',
  damage: { count: 1, die: 'd6', type: 'bludgeoning' },
  properties: ['versatile'],
  mastery: 'topple',
};

export const shortbow: Weapon = {
  id: 'shortbow',
  name: 'Shortbow',
  cost: { amount: 25, unit: 'gp' },
  weight: 2,
  category: 'simple',
  attackType: 'ranged',
  damage: { count: 1, die: 'd6', type: 'piercing' },
  properties: ['ammunition', 'two-handed'],
  mastery: 'vex',
  range: { normal: 80, long: 320 },
};

export const scimitar: Weapon = {
  id: 'scimitar',
  name: 'Scimitar',
  cost: { amount: 25, unit: 'gp' },
  weight: 3,
  category: 'martial',
  attackType: 'melee',
  damage: { count: 1, die: 'd6', type: 'slashing' },
  properties: ['finesse', 'light'],
  mastery: 'nick',
};

export const shortsword: Weapon = {
  id: 'shortsword',
  name: 'Shortsword',
  cost: { amount: 10, unit: 'gp' },
  weight: 2,
  category: 'martial',
  attackType: 'melee',
  damage: { count: 1, die: 'd6', type: 'piercing' },
  properties: ['finesse', 'light'],
  mastery: 'vex',
};

export const longbow: Weapon = {
  id: 'longbow',
  name: 'Longbow',
  cost: { amount: 50, unit: 'gp' },
  weight: 2,
  category: 'martial',
  attackType: 'ranged',
  damage: { count: 1, die: 'd8', type: 'piercing' },
  properties: ['ammunition', 'heavy', 'two-handed'],
  mastery: 'slow',
  range: { normal: 150, long: 600 },
};
