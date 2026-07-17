import type { Weapon } from '../../types/item';
import { flail, greatsword, javelin, longbow, scimitar, shortsword } from './weapons';

export { chainMail, studdedLeather } from './armor';
export { arrows, dungeoneersPack, quiver } from './gear';
export { flail, greatsword, javelin, longbow, scimitar, shortsword };

export const weapons: Weapon[] = [greatsword, flail, javelin, scimitar, shortsword, longbow];
