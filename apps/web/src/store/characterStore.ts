import type { BuildEvent } from "@pc-manager/engine";
import {
  type Character,
  appendEvent,
  createCharacter,
  duplicateCharacter,
  renameCharacter,
  truncateLog,
} from "../character";
import { type ImportResult, parseCharacterFile } from "../characterFile";
import { type CharacterDb, createIndexedDbCharacterDb } from "./db";

export interface CharacterStoreSnapshot {
  /** "loading" until the first hydrate from IndexedDB completes. */
  status: "loading" | "ready";
  /** All characters, most-recently-updated first. */
  characters: Character[];
}

/**
 * The reactive character store: an in-memory cache mirrored to IndexedDB, plus
 * the *only* API for mutating characters. Every mutation is autosaved (the cache
 * and the database move together) and every reader is notified. Because a
 * character is just its build log, `appendEvent`/`truncateLog` are the whole
 * editing surface — level-up is an append, undo is a truncate.
 *
 * Built as a factory over a `CharacterDb` so tests can run against an isolated
 * database; the app uses the `characterStore` singleton below.
 */
export interface CharacterStore {
  subscribe(listener: () => void): () => void;
  getSnapshot(): CharacterStoreSnapshot;
  /** Load all characters from the database. Idempotent; safe to call repeatedly. */
  hydrate(): Promise<void>;
  create(name: string): Promise<Character>;
  rename(id: string, name: string): Promise<void>;
  duplicate(id: string): Promise<Character | undefined>;
  remove(id: string): Promise<void>;
  appendEvent(id: string, event: BuildEvent): Promise<void>;
  truncateLog(id: string, length: number): Promise<void>;
  /** Import an exported JSON file, persisting it under a fresh id on collision. */
  importFile(json: string): Promise<ImportResult>;
}

export function createCharacterStore(db: CharacterDb): CharacterStore {
  const cache = new Map<string, Character>();
  let status: CharacterStoreSnapshot["status"] = "loading";
  const listeners = new Set<() => void>();

  // useSyncExternalStore requires getSnapshot to return a stable reference while
  // nothing has changed, so the snapshot is memoised and only rebuilt on writes.
  let snapshot: CharacterStoreSnapshot = { status, characters: [] };

  function rebuildSnapshot(): void {
    const characters = [...cache.values()].sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    );
    snapshot = { status, characters };
  }

  function emit(): void {
    rebuildSnapshot();
    for (const listener of listeners) listener();
  }

  /** Write to cache and database together, then notify. Autosave lives here. */
  async function commit(character: Character): Promise<void> {
    cache.set(character.id, character);
    await db.put(character);
    emit();
  }

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    getSnapshot() {
      return snapshot;
    },

    async hydrate() {
      const all = await db.getAll();
      cache.clear();
      for (const character of all) cache.set(character.id, character);
      status = "ready";
      emit();
    },

    async create(name) {
      const character = createCharacter(name);
      await commit(character);
      return character;
    },

    async rename(id, name) {
      const existing = cache.get(id);
      if (!existing) return;
      await commit(renameCharacter(existing, name));
    },

    async duplicate(id) {
      const existing = cache.get(id);
      if (!existing) return undefined;
      const copy = duplicateCharacter(existing);
      await commit(copy);
      return copy;
    },

    async remove(id) {
      cache.delete(id);
      await db.remove(id);
      emit();
    },

    async appendEvent(id, event) {
      const existing = cache.get(id);
      if (!existing) return;
      await commit(appendEvent(existing, event));
    },

    async truncateLog(id, length) {
      const existing = cache.get(id);
      if (!existing) return;
      await commit(truncateLog(existing, length));
    },

    async importFile(json) {
      const result = parseCharacterFile(json);
      if (!result.ok) return result;
      // Never clobber an existing character; a colliding id gets a fresh one so
      // import is always additive. (After export → delete → import there is no
      // collision, so a genuine restore keeps its original id.)
      const character = cache.has(result.character.id)
        ? { ...result.character, id: crypto.randomUUID() }
        : result.character;
      await commit(character);
      return { ok: true, character };
    },
  };
}

/** The app-wide singleton, backed by the default IndexedDB database. */
export const characterStore = createCharacterStore(createIndexedDbCharacterDb());
