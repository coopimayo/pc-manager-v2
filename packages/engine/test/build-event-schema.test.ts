import { describe, expect, it } from "vitest";
import { buildEventSchema } from "../src/schemas.js";
import type { BuildEvent } from "../src/types.js";

// The build log is what gets exported/imported as a character file, so its
// schema is the trust boundary for untrusted JSON. These tests pin down what it
// accepts and rejects; the two-way type assignment in schemas.ts pins the shape.

describe("buildEventSchema", () => {
  const valid: BuildEvent[] = [
    { type: "characterCreated", name: "Aria", packIds: ["srd-5.2"] },
    {
      type: "abilityScoresSet",
      method: "standardArray",
      scores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
    },
    { type: "classLevelTaken", classId: "fighter" },
    { type: "classLevelTaken", classId: "fighter", hpRoll: 7 },
    { type: "decisionResolved", decisionId: "species", optionIds: ["human"] },
  ];

  it("accepts every valid event shape", () => {
    for (const event of valid) {
      expect(buildEventSchema.parse(event)).toEqual(event);
    }
  });

  it("rejects an unknown event type", () => {
    expect(buildEventSchema.safeParse({ type: "levelDown", classId: "fighter" }).success).toBe(
      false,
    );
  });

  it("rejects an abilityScoresSet missing an ability", () => {
    const result = buildEventSchema.safeParse({
      type: "abilityScoresSet",
      method: "manual",
      scores: { str: 15, dex: 14, con: 13, int: 12, wis: 10 },
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown ability-score method", () => {
    const result = buildEventSchema.safeParse({
      type: "abilityScoresSet",
      method: "roll4d6",
      scores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
    });
    expect(result.success).toBe(false);
  });

  it("rejects an hpRoll below 1", () => {
    expect(
      buildEventSchema.safeParse({ type: "classLevelTaken", classId: "fighter", hpRoll: 0 }).success,
    ).toBe(false);
  });
});
