import type { BuildEvent } from "@pc-manager/engine";
import { srdPack } from "@pc-manager/content-srd";

/**
 * A character *is* its build log plus the packs it opts into — nothing derived
 * is stored (PLAN.md core decision #1). This in-memory shape is a placeholder:
 * step 2.2 replaces the App-level state with an IndexedDB-backed store and adds
 * the persisted file fields (createdAt/updatedAt/formatVersion).
 */
export interface Character {
  id: string;
  name: string;
  packIds: string[];
  buildLog: BuildEvent[];
}

let sequence = 0;

export function createCharacter(name: string): Character {
  const id = `char-${Date.now().toString(36)}-${sequence++}`;
  const packIds = [srdPack.id];
  return {
    id,
    name,
    packIds,
    // A brand-new character only knows its own creation. Ability scores,
    // species, class, etc. are appended as events by the creation wizard (2.4).
    buildLog: [{ type: "characterCreated", name, packIds }],
  };
}
