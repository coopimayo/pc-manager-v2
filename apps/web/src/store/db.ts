import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import { type Character } from "../character";

/**
 * The IndexedDB persistence adapter. Deliberately dumb: it stores and retrieves
 * whole `Character` files keyed by id and knows nothing about mutation rules or
 * derivation. The reactive store (store.ts) is the only thing that calls it.
 */
export interface CharacterDb {
  getAll(): Promise<Character[]>;
  put(character: Character): Promise<void>;
  remove(id: string): Promise<void>;
}

interface Schema extends DBSchema {
  characters: { key: string; value: Character };
}

const DEFAULT_DB_NAME = "pc-manager";
const STORE = "characters";

/**
 * Real IndexedDB-backed store. `dbName` is parameterised so tests can isolate
 * themselves in their own database. The connection is opened lazily on first
 * use so importing this module never touches IndexedDB (keeps SSR/tests inert).
 */
export function createIndexedDbCharacterDb(dbName: string = DEFAULT_DB_NAME): CharacterDb {
  let dbPromise: Promise<IDBPDatabase<Schema>> | undefined;

  function db(): Promise<IDBPDatabase<Schema>> {
    dbPromise ??= openDB<Schema>(dbName, 1, {
      upgrade(database) {
        database.createObjectStore(STORE, { keyPath: "id" });
      },
    });
    return dbPromise;
  }

  return {
    async getAll() {
      return (await db()).getAll(STORE);
    },
    async put(character) {
      await (await db()).put(STORE, character);
    },
    async remove(id) {
      await (await db()).delete(STORE, id);
    },
  };
}
