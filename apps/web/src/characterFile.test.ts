import { describe, expect, it } from "vitest";
import {
  type Character,
  CURRENT_FORMAT_VERSION,
  appendEvent,
  createCharacter,
} from "./character";
import { parseCharacterFile, serializeCharacter } from "./characterFile";

function sampleCharacter(): Character {
  // A slightly-built character so the round-trip exercises more than the stub.
  let character = createCharacter("Aria");
  character = appendEvent(character, {
    type: "abilityScoresSet",
    method: "standardArray",
    scores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
  });
  character = appendEvent(character, { type: "classLevelTaken", classId: "fighter" });
  character = appendEvent(character, {
    type: "decisionResolved",
    decisionId: "species",
    optionIds: ["human"],
  });
  return character;
}

describe("serialize/parse round-trip", () => {
  it("restores an identical character through export → import", () => {
    const original = sampleCharacter();
    const result = parseCharacterFile(serializeCharacter(original));
    expect(result).toEqual({ ok: true, character: original });
  });

  it("preserves timestamps and id (a faithful restore, not a fresh file)", () => {
    const original = sampleCharacter();
    const result = parseCharacterFile(serializeCharacter(original));
    expect(result.ok && result.character.id).toBe(original.id);
    expect(result.ok && result.character.createdAt).toBe(original.createdAt);
    expect(result.ok && result.character.updatedAt).toBe(original.updatedAt);
  });
});

describe("import validation", () => {
  it("rejects non-JSON input", () => {
    const result = parseCharacterFile("{not json");
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.error).toMatch(/not valid JSON/i);
  });

  it("rejects a file with a malformed build event", () => {
    const broken = sampleCharacter() as unknown as { buildLog: unknown[] };
    broken.buildLog[1] = { type: "abilityScoresSet", method: "standardArray", scores: { str: 15 } };
    const result = parseCharacterFile(JSON.stringify(broken));
    expect(result.ok).toBe(false);
  });

  it("rejects a file missing required fields", () => {
    const result = parseCharacterFile(JSON.stringify({ id: "x", name: "y" }));
    expect(result.ok).toBe(false);
  });

  it("rejects a file from a newer format version with a clear message", () => {
    const future = { ...sampleCharacter(), formatVersion: CURRENT_FORMAT_VERSION + 1 };
    const result = parseCharacterFile(JSON.stringify(future));
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.error).toMatch(/format version/i);
  });
});
