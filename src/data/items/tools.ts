import type { Tool } from '../../types/item';

export const calligraphersSupplies: Tool = { id: 'calligraphers-supplies', name: "Calligrapher's Supplies", cost: { amount: 10, unit: 'gp' }, weight: 5, ability: 'dex', category: 'artisan' };
export const carpentersTools: Tool = { id: 'carpenters-tools', name: "Carpenter's Tools", cost: { amount: 8, unit: 'gp' }, weight: 6, ability: 'str', category: 'artisan' };
export const cartographersTools: Tool = { id: 'cartographers-tools', name: "Cartographer's Tools", cost: { amount: 15, unit: 'gp' }, weight: 6, ability: 'wis', category: 'artisan' };

export const forgeryKit: Tool = { id: 'forgery-kit', name: 'Forgery Kit', cost: { amount: 15, unit: 'gp' }, weight: 5, ability: 'dex', category: 'other' };
export const gamingSet: Tool = { id: 'gaming-set', name: 'Gaming Set', cost: { amount: 1, unit: 'sp' }, weight: 0, ability: 'wis', category: 'other' };
export const herbalismKit: Tool = { id: 'herbalism-kit', name: 'Herbalism Kit', cost: { amount: 5, unit: 'gp' }, weight: 3, ability: 'int', category: 'other' };
export const musicalInstrument: Tool = { id: 'musical-instrument', name: 'Musical Instrument', cost: { amount: 2, unit: 'gp' }, weight: 1, ability: 'cha', category: 'other' };
export const navigatorsTools: Tool = { id: 'navigators-tools', name: "Navigator's Tools", cost: { amount: 25, unit: 'gp' }, weight: 2, ability: 'wis', category: 'other' };
export const thievesTools: Tool = { id: 'thieves-tools', name: "Thieves' Tools", cost: { amount: 25, unit: 'gp' }, weight: 1, ability: 'dex', category: 'other' };
