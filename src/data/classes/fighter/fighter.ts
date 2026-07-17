import type { Class } from '../../../types/class';
import {
  arrows,
  chainMail,
  dungeoneersPack,
  flail,
  greatsword,
  javelin,
  longbow,
  quiver,
  scimitar,
  shortsword,
  studdedLeather,
} from '../../items';
import { fighterFeatures } from './features';

export const fighter: Class = {
  id: 'fighter',
  name: 'Fighter',
  description:
    'A master of martial combat, skilled with a variety of weapons and armor. Fighters train relentlessly to turn any weapon into a decisive tool.',
  hitDie: 'd10',
  primaryAbility: ['str', 'dex'],
  savingThrowProficiencies: ['str', 'con'],
  skillProficiencies: {
    choose: 2,
    from: [
      'acrobatics',
      'animal-handling',
      'athletics',
      'history',
      'insight',
      'intimidation',
      'perception',
      'persuasion',
      'survival',
    ],
  },
  weaponProficiencies: ['Simple weapons', 'Martial weapons'],
  toolProficiencies: [],
  armorProficiencies: ['Light armor', 'Medium armor', 'Heavy armor', 'Shields'],
  startingEquipment: {
    choose: 1,
    from: [
      { label: 'A', items: [chainMail, greatsword, flail, javelin, dungeoneersPack], gold: 4 },
      { label: 'B', items: [studdedLeather, scimitar, shortsword, longbow, arrows, quiver, dungeoneersPack], gold: 11 },
      { label: 'C', items: [], gold: 155 },
    ],
  },
  features: fighterFeatures,
};
