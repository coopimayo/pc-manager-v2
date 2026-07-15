import { describe, expect, it } from "vitest";
import type { PendingDecision, ResolvedOption } from "@pc-manager/engine";
import {
  SEARCH_THRESHOLD,
  canIncrement,
  countOf,
  decrement,
  emptySelection,
  filterOptions,
  increment,
  isComplete,
  optionRows,
  toOptionIds,
  toggle,
  totalSelected,
} from "./decisionSelection";

/** Build a PendingDecision; the selection module only reads `pending.options`
 * and the count/allowDuplicates/maxPerOption on `pending.decision`. */
function makePending(opts: {
  count?: number;
  allowDuplicates?: boolean;
  maxPerOption?: number;
  options: ResolvedOption[];
}): PendingDecision {
  return {
    instanceId: "d1",
    source: "Test",
    decision: {
      id: "d1",
      prompt: "Choose",
      count: opts.count ?? 1,
      ...(opts.allowDuplicates !== undefined ? { allowDuplicates: opts.allowDuplicates } : {}),
      ...(opts.maxPerOption !== undefined ? { maxPerOption: opts.maxPerOption } : {}),
      options: { source: "list", options: [] },
    },
    options: opts.options,
  };
}

const opt = (id: string, eligible = true, reason?: string): ResolvedOption => ({
  id,
  label: id.toUpperCase(),
  eligible,
  ...(reason ? { reason } : {}),
});

describe("count enforcement", () => {
  it("is complete only when exactly `count` picks are made", () => {
    const p = makePending({ count: 1, options: [opt("a"), opt("b")] });
    let s = emptySelection();
    expect(isComplete(p, s)).toBe(false);
    s = toggle(p, s, "a");
    expect(totalSelected(s)).toBe(1);
    expect(isComplete(p, s)).toBe(true);
    expect(toOptionIds(s)).toEqual(["a"]);
  });

  it("caps a multi-select at `count` and greys the rest, but still allows deselect", () => {
    const p = makePending({ count: 2, options: [opt("a"), opt("b"), opt("c")] });
    let s = toggle(p, emptySelection(), "a");
    s = toggle(p, s, "b");
    expect(isComplete(p, s)).toBe(true);
    // A third pick is blocked.
    expect(canIncrement(p, s, "c")).toBe(false);
    s = toggle(p, s, "c");
    expect(toOptionIds(s).sort()).toEqual(["a", "b"]);
    // Deselecting an already-chosen option still works.
    s = toggle(p, s, "a");
    expect(totalSelected(s)).toBe(1);
    expect(canIncrement(p, s, "c")).toBe(true);
  });
});

describe("single-select radio behaviour", () => {
  it("replaces the current pick instead of stacking", () => {
    const p = makePending({ count: 1, options: [opt("a"), opt("b")] });
    let s = toggle(p, emptySelection(), "a");
    s = toggle(p, s, "b");
    expect(toOptionIds(s)).toEqual(["b"]);
    // Clicking the selected option again clears it.
    s = toggle(p, s, "b");
    expect(totalSelected(s)).toBe(0);
  });
});

describe("duplicate rules", () => {
  it("blocks picking the same option twice when duplicates are off", () => {
    const p = makePending({ count: 2, options: [opt("a"), opt("b")] });
    let s = increment(p, emptySelection(), "a");
    expect(countOf(s, "a")).toBe(1);
    s = increment(p, s, "a");
    expect(countOf(s, "a")).toBe(1); // unchanged
  });

  it("allows duplicates up to maxPerOption and the total count (ASI-style)", () => {
    const p = makePending({
      count: 2,
      allowDuplicates: true,
      maxPerOption: 2,
      options: [opt("str"), opt("dex")],
    });
    let s = increment(p, emptySelection(), "str");
    s = increment(p, s, "str");
    expect(countOf(s, "str")).toBe(2);
    expect(isComplete(p, s)).toBe(true);
    expect(toOptionIds(s)).toEqual(["str", "str"]);
    // Total count is reached, so a different option can't be added.
    expect(canIncrement(p, s, "dex")).toBe(false);
  });

  it("honours a per-option cap below the total count", () => {
    const p = makePending({
      count: 3,
      allowDuplicates: true,
      maxPerOption: 1,
      options: [opt("a"), opt("b"), opt("c")],
    });
    const s = increment(p, emptySelection(), "a");
    expect(canIncrement(p, s, "a")).toBe(false); // capped at 1
    expect(canIncrement(p, s, "b")).toBe(true);
  });

  it("decrement steps a duplicate count back down", () => {
    const p = makePending({ count: 2, allowDuplicates: true, maxPerOption: 2, options: [opt("str")] });
    let s = increment(p, emptySelection(), "str");
    s = increment(p, s, "str");
    s = decrement(s, "str");
    expect(countOf(s, "str")).toBe(1);
  });
});

describe("eligibility gating", () => {
  it("never selects an ineligible option and surfaces its reason", () => {
    const p = makePending({ options: [opt("a"), opt("bad", false, "already taken")] });
    expect(canIncrement(p, emptySelection(), "bad")).toBe(false);
    const s = toggle(p, emptySelection(), "bad");
    expect(totalSelected(s)).toBe(0); // no-op

    const rows = optionRows(p, emptySelection());
    const badRow = rows.find((r) => r.option.id === "bad")!;
    expect(badRow.canIncrement).toBe(false);
    expect(badRow.option.reason).toBe("already taken");
  });

  it("reports per-option enablement in the view model", () => {
    const p = makePending({ count: 2, options: [opt("a"), opt("b")] });
    const s = increment(p, emptySelection(), "a");
    const rows = optionRows(p, s);
    const a = rows.find((r) => r.option.id === "a")!;
    expect(a.count).toBe(1);
    expect(a.canDecrement).toBe(true);
  });
});

describe("search filtering", () => {
  it("filters options by case-insensitive label substring", () => {
    const options = [opt("elf"), opt("dwarf"), opt("half-elf")];
    expect(filterOptions(options, "elf").map((o) => o.id)).toEqual(["elf", "half-elf"]);
  });

  it("returns everything for an empty or whitespace query", () => {
    const options = [opt("a"), opt("b")];
    expect(filterOptions(options, "")).toHaveLength(2);
    expect(filterOptions(options, "   ")).toHaveLength(2);
  });

  it("exposes a threshold for when to show the search box", () => {
    expect(SEARCH_THRESHOLD).toBe(12);
  });
});
