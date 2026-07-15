import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { type Character } from "../character";
import { serializeCharacter } from "../characterFile";
import { type CharacterStore, createCharacterStore } from "./characterStore";
import { createIndexedDbCharacterDb } from "./db";

// Each test gets its own IndexedDB database so state never leaks between them.
let dbName: string;
let counter = 0;

function freshStore(): CharacterStore {
  return createCharacterStore(createIndexedDbCharacterDb(dbName));
}

/** Simulate a browser reload: a brand-new store connecting to the same database. */
async function reload(): Promise<CharacterStore> {
  const store = freshStore();
  await store.hydrate();
  return store;
}

beforeEach(() => {
  dbName = `pc-manager-test-${counter++}`;
});

describe("create / list / persistence", () => {
  it("creates a character and reports it in the snapshot", async () => {
    const store = freshStore();
    await store.hydrate();
    expect(store.getSnapshot().status).toBe("ready");

    const created = await store.create("Aria");
    expect(store.getSnapshot().characters).toEqual([created]);
    expect(created.buildLog[0]).toMatchObject({ type: "characterCreated", name: "Aria" });
  });

  it("persists across a reload", async () => {
    const store = freshStore();
    await store.create("Aria");
    await store.create("Borin");

    const reloaded = await reload();
    expect(reloaded.getSnapshot().characters.map((c) => c.name).sort()).toEqual(["Aria", "Borin"]);
  });

  it("notifies subscribers on change", async () => {
    const store = await reload();
    let calls = 0;
    const unsubscribe = store.subscribe(() => calls++);
    await store.create("Aria");
    expect(calls).toBe(1);
    unsubscribe();
    await store.create("Borin");
    expect(calls).toBe(1);
  });

  it("sorts the snapshot by most-recently-updated first", async () => {
    const store = await reload();
    await store.importFile(makeFile({ id: "old", name: "Old", updatedAt: "2026-01-01T00:00:00.000Z" }));
    await store.importFile(makeFile({ id: "new", name: "New", updatedAt: "2026-06-01T00:00:00.000Z" }));
    expect(store.getSnapshot().characters.map((c) => c.id)).toEqual(["new", "old"]);
  });
});

describe("rename / duplicate / delete", () => {
  it("renames both the file and the characterCreated event, and persists", async () => {
    const store = freshStore();
    const created = await store.create("Aria");
    await store.rename(created.id, "Aria the Bold");

    const renamed = store.getSnapshot().characters[0];
    expect(renamed?.name).toBe("Aria the Bold");
    expect(renamed?.buildLog[0]).toMatchObject({ name: "Aria the Bold" });

    const reloaded = await reload();
    expect(reloaded.getSnapshot().characters[0]?.name).toBe("Aria the Bold");
  });

  it("duplicates into an independent copy", async () => {
    const store = freshStore();
    const original = await store.create("Aria");
    const copy = await store.duplicate(original.id);

    expect(copy?.id).not.toBe(original.id);
    expect(copy?.name).toBe("Aria (copy)");
    expect(store.getSnapshot().characters).toHaveLength(2);

    // Editing the copy must not touch the original's log.
    await store.appendEvent(copy!.id, { type: "classLevelTaken", classId: "fighter" });
    const originalAfter = store.getSnapshot().characters.find((c) => c.id === original.id);
    expect(originalAfter?.buildLog).toHaveLength(1);
  });

  it("deletes a character and the deletion survives reload", async () => {
    const store = freshStore();
    const a = await store.create("Aria");
    await store.create("Borin");
    await store.remove(a.id);
    expect(store.getSnapshot().characters.map((c) => c.name)).toEqual(["Borin"]);

    const reloaded = await reload();
    expect(reloaded.getSnapshot().characters.map((c) => c.name)).toEqual(["Borin"]);
  });
});

describe("append / truncate (the whole editing surface)", () => {
  it("appends build events and persists them", async () => {
    const store = freshStore();
    const created = await store.create("Aria");
    await store.appendEvent(created.id, {
      type: "abilityScoresSet",
      method: "manual",
      scores: { str: 16, dex: 14, con: 14, int: 10, wis: 12, cha: 8 },
    });
    await store.appendEvent(created.id, { type: "classLevelTaken", classId: "fighter" });

    const reloaded = await reload();
    expect(reloaded.getSnapshot().characters[0]?.buildLog).toHaveLength(3);
  });

  it("truncates the log (undo) without dropping characterCreated", async () => {
    const store = freshStore();
    const created = await store.create("Aria");
    await store.appendEvent(created.id, { type: "classLevelTaken", classId: "fighter" });
    await store.appendEvent(created.id, { type: "classLevelTaken", classId: "fighter" });

    await store.truncateLog(created.id, 2);
    expect(store.getSnapshot().characters[0]?.buildLog).toHaveLength(2);

    await store.truncateLog(created.id, 0); // clamped up to keep characterCreated
    expect(store.getSnapshot().characters[0]?.buildLog).toHaveLength(1);
  });
});

describe("import", () => {
  it("restores an exported file under its original id when there is no collision", async () => {
    const store = freshStore();
    const created = await store.create("Aria");
    const json = serializeCharacter(created);
    await store.remove(created.id);

    const result = await store.importFile(json);
    expect(result.ok && result.character.id).toBe(created.id);
    expect(store.getSnapshot().characters).toHaveLength(1);
  });

  it("assigns a fresh id when importing over an existing character", async () => {
    const store = freshStore();
    const created = await store.create("Aria");
    const result = await store.importFile(serializeCharacter(created));

    expect(result.ok).toBe(true);
    expect(result.ok && result.character.id).not.toBe(created.id);
    expect(store.getSnapshot().characters).toHaveLength(2);
  });

  it("reports a validation error without mutating the store", async () => {
    const store = await reload();
    const result = await store.importFile("{ not a character }");
    expect(result.ok).toBe(false);
    expect(store.getSnapshot().characters).toHaveLength(0);
  });
});

// --- helpers ---

function makeFile(overrides: Partial<Character> & { id: string }): string {
  const base: Character = {
    id: overrides.id,
    name: overrides.name ?? "Test",
    packIds: ["srd-5.2"],
    buildLog: [{ type: "characterCreated", name: overrides.name ?? "Test", packIds: ["srd-5.2"] }],
    createdAt: overrides.createdAt ?? "2026-01-01T00:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-01-01T00:00:00.000Z",
    formatVersion: 1,
  };
  return serializeCharacter({ ...base, ...overrides });
}
