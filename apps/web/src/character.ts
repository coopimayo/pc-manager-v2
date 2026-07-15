import type { BuildEvent } from "@pc-manager/engine";
import { srdPack } from "@pc-manager/content-srd";

/**
 * The persisted character file. A character *is* its build log plus the packs it
 * opts into (PLAN.md core decision #1) — nothing derived is stored. The extra
 * fields are pure metadata: `id` keys the store, the timestamps drive sorting,
 * and `formatVersion` lets import migrate older files (see characterFile.ts).
 *
 * `name` is a denormalised copy of the build log's `characterCreated` name so the
 * list can render without deriving every character. `renameCharacter` keeps the
 * two in sync; nothing else may write it.
 */
export interface Character {
  id: string;
  name: string;
  packIds: string[];
  buildLog: BuildEvent[];
  createdAt: string;
  updatedAt: string;
  formatVersion: number;
}

/** Bump whenever the file shape or BuildEvent union changes; add a migration. */
export const CURRENT_FORMAT_VERSION = 1;

function newId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  // Fallback for environments without WebCrypto (older Node in tooling).
  return `char-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function now(): string {
  return new Date().toISOString();
}

export function createCharacter(name: string): Character {
  const packIds = [srdPack.id];
  const timestamp = now();
  return {
    id: newId(),
    name,
    packIds,
    // A brand-new character only knows its own creation. Ability scores,
    // species, class, etc. are appended as events by the creation wizard (2.4).
    buildLog: [{ type: "characterCreated", name, packIds }],
    createdAt: timestamp,
    updatedAt: timestamp,
    formatVersion: CURRENT_FORMAT_VERSION,
  };
}

/**
 * Rename a character. The name lives in two places — the file field and the
 * `characterCreated` event that derivation reads for `sheet.name` — so both are
 * updated together to keep the list and the sheet in agreement.
 */
export function renameCharacter(character: Character, name: string): Character {
  const buildLog = character.buildLog.map((event) =>
    event.type === "characterCreated" ? { ...event, name } : event,
  );
  return { ...character, name, buildLog, updatedAt: now() };
}

/** Copy a character into a new independent file (fresh id and timestamps). */
export function duplicateCharacter(character: Character, name?: string): Character {
  const copyName = name ?? `${character.name} (copy)`;
  const base = createCharacter(copyName);
  return {
    ...base,
    packIds: [...character.packIds],
    // Deep-copy the log so edits to the copy never reach back into the original.
    buildLog: structuredClone(character.buildLog).map((event) =>
      event.type === "characterCreated" ? { ...event, name: copyName } : event,
    ),
  };
}

/** Append one build event (level-up, decision, ability scores). */
export function appendEvent(character: Character, event: BuildEvent): Character {
  return { ...character, buildLog: [...character.buildLog, event], updatedAt: now() };
}

/**
 * Truncate the build log to its first `length` events (undo). `characterCreated`
 * must remain, so `length` is clamped to at least 1.
 */
export function truncateLog(character: Character, length: number): Character {
  const clamped = Math.max(1, Math.min(length, character.buildLog.length));
  return { ...character, buildLog: character.buildLog.slice(0, clamped), updatedAt: now() };
}
