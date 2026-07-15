import type { PendingDecision, ResolvedOption } from "@pc-manager/engine";

/**
 * The selection state machine behind <DecisionCard>, kept as pure functions so
 * the rules (count, allowDuplicates, maxPerOption, eligibility) are testable in
 * the node environment without a DOM — matching how the engine and store are
 * tested. The component is a thin render over this module.
 *
 * A selection is a multiset: option id → how many times it is currently picked.
 * Most decisions pick distinct options (count → a Map of 1s); duplicate-allowed
 * decisions (e.g. an ASI's +1/+1 to one ability) let an id's count climb.
 */
export type Selection = ReadonlyMap<string, number>;

/** Show a search box once an option list grows past this (feats now, spells later). */
export const SEARCH_THRESHOLD = 12;

export function emptySelection(): Selection {
  return new Map();
}

export function totalSelected(selection: Selection): number {
  let total = 0;
  for (const n of selection.values()) total += n;
  return total;
}

export function countOf(selection: Selection, optionId: string): number {
  return selection.get(optionId) ?? 0;
}

function findOption(pending: PendingDecision, optionId: string): ResolvedOption | undefined {
  return pending.options.find((o) => o.id === optionId);
}

function withCount(selection: Selection, optionId: string, next: number): Selection {
  const copy = new Map(selection);
  if (next <= 0) copy.delete(optionId);
  else copy.set(optionId, next);
  return copy;
}

/** Can this option be picked (once more)? Enforces eligibility, the total
 * `count`, the no-duplicates rule, and any per-option cap. */
export function canIncrement(
  pending: PendingDecision,
  selection: Selection,
  optionId: string,
): boolean {
  const option = findOption(pending, optionId);
  if (!option || !option.eligible) return false;
  const { count, allowDuplicates, maxPerOption } = pending.decision;
  if (totalSelected(selection) >= count) return false;
  const current = countOf(selection, optionId);
  if (!allowDuplicates && current >= 1) return false;
  if (maxPerOption !== undefined && current >= maxPerOption) return false;
  return true;
}

export function canDecrement(selection: Selection, optionId: string): boolean {
  return countOf(selection, optionId) > 0;
}

export function increment(
  pending: PendingDecision,
  selection: Selection,
  optionId: string,
): Selection {
  if (!canIncrement(pending, selection, optionId)) return selection;
  return withCount(selection, optionId, countOf(selection, optionId) + 1);
}

export function decrement(selection: Selection, optionId: string): Selection {
  if (!canDecrement(selection, optionId)) return selection;
  return withCount(selection, optionId, countOf(selection, optionId) - 1);
}

/**
 * Click-to-toggle for the non-duplicate interaction mode. Clicking a selected
 * option clears it; clicking an unselected one selects it, and — when only a
 * single pick is allowed — replaces the current selection (radio behaviour, so
 * the user never has to deselect first).
 */
export function toggle(
  pending: PendingDecision,
  selection: Selection,
  optionId: string,
): Selection {
  if (countOf(selection, optionId) > 0) {
    return withCount(selection, optionId, 0);
  }
  const option = findOption(pending, optionId);
  if (!option || !option.eligible) return selection;
  if (pending.decision.count === 1) {
    return new Map([[optionId, 1]]);
  }
  if (totalSelected(selection) >= pending.decision.count) return selection;
  return withCount(selection, optionId, 1);
}

/** A selection is confirmable exactly when the required number of picks is met. */
export function isComplete(pending: PendingDecision, selection: Selection): boolean {
  return totalSelected(selection) === pending.decision.count;
}

/** Flatten to the `optionIds` a `decisionResolved` event carries (duplicates repeated). */
export function toOptionIds(selection: Selection): string[] {
  const ids: string[] = [];
  for (const [id, n] of selection) {
    for (let i = 0; i < n; i++) ids.push(id);
  }
  return ids;
}

export interface OptionRow {
  option: ResolvedOption;
  count: number;
  canIncrement: boolean;
  canDecrement: boolean;
}

/** Per-option view model the component renders (selection counts + what's enabled). */
export function optionRows(pending: PendingDecision, selection: Selection): OptionRow[] {
  return pending.options.map((option) => ({
    option,
    count: countOf(selection, option.id),
    canIncrement: canIncrement(pending, selection, option.id),
    canDecrement: canDecrement(selection, option.id),
  }));
}

/** Case-insensitive substring filter over option labels. Empty query → all. */
export function filterOptions(options: ResolvedOption[], query: string): ResolvedOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return options;
  return options.filter((o) => o.label.toLowerCase().includes(q));
}
