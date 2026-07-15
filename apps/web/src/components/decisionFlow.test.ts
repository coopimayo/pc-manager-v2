import { describe, expect, it } from "vitest";
import { type BuildEvent, derive } from "@pc-manager/engine";
import { srdPack } from "@pc-manager/content-srd";

/**
 * The decision loop <DecisionCard> drives, verified at the engine boundary: the
 * UI appends a `decisionResolved` event, re-derives, and any newly-opened
 * decision must appear in the pending list with no content-specific code. These
 * pure derivations are exactly what the component renders.
 */
function pendingIds(log: BuildEvent[]): string[] {
  return derive([srdPack], log).pendingDecisions.map((d) => d.instanceId);
}

const created: BuildEvent = { type: "characterCreated", name: "Test", packIds: [srdPack.id] };

describe("decision resolution flow", () => {
  it("offers species, background and languages on a fresh character", () => {
    expect(pendingIds([created])).toEqual(
      expect.arrayContaining(["species", "background", "languages"]),
    );
  });

  it("opens nested decisions in place when Elf is chosen", () => {
    const log: BuildEvent[] = [
      created,
      { type: "decisionResolved", decisionId: "species", optionIds: ["elf"] },
    ];
    const ids = pendingIds(log);
    // Elf grants both a lineage choice and a Keen Senses skill choice.
    expect(ids).toContain("elf:lineage");
    expect(ids).toContain("elf:keen-senses:choice");
    // The resolved decision is gone.
    expect(ids).not.toContain("species");
  });

  it("resolves a nested subspecies choice cleanly", () => {
    const log: BuildEvent[] = [
      created,
      { type: "decisionResolved", decisionId: "species", optionIds: ["elf"] },
      { type: "decisionResolved", decisionId: "elf:lineage", optionIds: ["elf-wood"] },
    ];
    const { sheet, findings } = derive([srdPack], log);
    expect(sheet.subspeciesId).toBe("elf-wood");
    expect(pendingIds(log)).not.toContain("elf:lineage");
    expect(findings.filter((f) => f.severity === "error")).toEqual([]);
  });
});
