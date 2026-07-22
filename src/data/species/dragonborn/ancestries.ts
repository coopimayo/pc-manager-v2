import type { Subspecies } from '../../../types/species';

const draconicAncestors: { id: string; name: string; damageType: string }[] = [
  { id: 'black', name: 'Black Dragon', damageType: 'Acid' },
  { id: 'blue', name: 'Blue Dragon', damageType: 'Lightning' },
  { id: 'brass', name: 'Brass Dragon', damageType: 'Fire' },
  { id: 'bronze', name: 'Bronze Dragon', damageType: 'Lightning' },
  { id: 'copper', name: 'Copper Dragon', damageType: 'Acid' },
  { id: 'gold', name: 'Gold Dragon', damageType: 'Fire' },
  { id: 'green', name: 'Green Dragon', damageType: 'Poison' },
  { id: 'red', name: 'Red Dragon', damageType: 'Fire' },
  { id: 'silver', name: 'Silver Dragon', damageType: 'Cold' },
  { id: 'white', name: 'White Dragon', damageType: 'Cold' },
];

export const dragonbornSubspecies: Subspecies[] = draconicAncestors.map(
  ({ id, name, damageType }) => ({
    id: `dragonborn-${id}`,
    speciesId: 'dragonborn',
    name,
    traits: [
      {
        id: `dragonborn-${id}-damage-resistance`,
        name: 'Damage Resistance',
        description: `You have Resistance to ${damageType} damage.`,
        effects: [],
      },
    ],
  }),
);
