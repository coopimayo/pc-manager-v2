import type { Weapon } from '../../types/item';
import { dagger, flail, greatsword, javelin, lightCrossbow, longbow, scimitar, shortbow, shortsword, sickle, spear } from './weapons';

export { chainMail, studdedLeather } from './armor';
export {
  arrows,
  bedroll,
  bolts,
  calligraphersSupplies,
  carpentersTools,
  costume,
  crowbar,
  dungeoneersPack,
  fineClothes,
  forgeryKit,
  gamingSet,
  healersKit,
  hoodedLantern,
  ironPot,
  lamp,
  manacles,
  mirror,
  musicalInstrument,
  navigatorsTools,
  oilFlask,
  parchment,
  perfume,
  pouch,
  quiver,
  rope,
  shovel,
  thievesTools,
  travelersClothes,
} from './gear';
export { dagger, flail, greatsword, javelin, lightCrossbow, longbow, scimitar, shortbow, shortsword, sickle, spear };

export const weapons: Weapon[] = [greatsword, flail, javelin, scimitar, shortsword, longbow, spear, shortbow, dagger, sickle, lightCrossbow];
