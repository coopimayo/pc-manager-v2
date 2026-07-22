import type { Tool, Weapon } from '../../types/item';
import { calligraphersSupplies, carpentersTools, cartographersTools, forgeryKit, gamingSet, herbalismKit, musicalInstrument, navigatorsTools, thievesTools } from './tools';
import { dagger, flail, greatsword, javelin, lightCrossbow, longbow, quarterstaff, scimitar, shortbow, shortsword, sickle, spear } from './weapons';

export { chainMail, studdedLeather } from './armor';
export { calligraphersSupplies, carpentersTools, cartographersTools, forgeryKit, gamingSet, herbalismKit, musicalInstrument, navigatorsTools, thievesTools } from './tools';
export {
  arrows,
  artisansTools,
  bedroll,
  bolts,
  bookOfHistory,
  bookOfPhilosophy,
  bookOfPrayers,
  costume,
  crowbar,
  dungeoneersPack,
  fineClothes,
  fishingTackle,
  healersKit,
  holySymbol,
  hoodedLantern,
  ironPot,
  lamp,
  manacles,
  mirror,
  oilFlask,
  parchment,
  parchmentEight,
  parchmentTen,
  perfume,
  pouch,
  quiver,
  robe,
  rope,
  shovel,
  tent,
  travelersClothes,
} from './gear';
export { dagger, flail, greatsword, javelin, lightCrossbow, longbow, quarterstaff, scimitar, shortbow, shortsword, sickle, spear };

export const weapons: Weapon[] = [greatsword, flail, javelin, quarterstaff, scimitar, shortsword, longbow, spear, shortbow, dagger, sickle, lightCrossbow];
export const tools: Tool[] = [calligraphersSupplies, carpentersTools, cartographersTools, forgeryKit, gamingSet, herbalismKit, musicalInstrument, navigatorsTools, thievesTools];
