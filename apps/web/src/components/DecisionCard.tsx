import { useMemo, useState } from "react";
import type { PendingDecision } from "@pc-manager/engine";
import {
  type Selection,
  SEARCH_THRESHOLD,
  emptySelection,
  filterOptions,
  isComplete,
  optionRows,
  toOptionIds,
  toggle,
  increment,
  decrement,
  totalSelected,
} from "./decisionSelection";
import styles from "./DecisionCard.module.css";

interface Props {
  decision: PendingDecision;
  /** Resolve the decision: append a `decisionResolved` event and re-derive. */
  onResolve: (instanceId: string, optionIds: string[]) => void;
}

/**
 * Renders any `PendingDecision` — species pick, subclass, skill choices, ASI,
 * feat selection — with no content-specific code. All the mechanics live in the
 * pure `decisionSelection` module; this component is the render and the wiring.
 *
 * Two interaction modes: click-to-toggle for ordinary picks, and a per-option
 * stepper when the decision allows the same option more than once. Ineligible
 * options are shown greyed with their reason. Confirm enables only once the
 * required number of selections is met.
 */
export function DecisionCard({ decision, onResolve }: Props): React.JSX.Element {
  const [selection, setSelection] = useState<Selection>(emptySelection);
  const [query, setQuery] = useState("");

  const stepper = decision.decision.allowDuplicates === true;
  const searchable = decision.options.length > SEARCH_THRESHOLD;

  const rows = useMemo(() => optionRows(decision, selection), [decision, selection]);
  const visibleRows = useMemo(() => {
    if (!query) return rows;
    const matches = new Set(filterOptions(decision.options, query).map((o) => o.id));
    return rows.filter((row) => matches.has(row.option.id));
  }, [rows, decision, query]);

  const chosen = totalSelected(selection);
  const status =
    decision.decision.count === 1
      ? "Choose one"
      : `${chosen} of ${decision.decision.count} selected`;

  function handleConfirm(): void {
    if (!isComplete(decision, selection)) return;
    onResolve(decision.instanceId, toOptionIds(selection));
  }

  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <h3 className={styles.prompt}>{decision.decision.prompt}</h3>
        <span className={styles.source}>{decision.source}</span>
      </header>

      <p className={styles.status}>{status}</p>

      {searchable && (
        <input
          className={styles.search}
          type="search"
          placeholder="Filter options…"
          aria-label="Filter options"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      )}

      {visibleRows.length === 0 ? (
        <p className={styles.empty}>No matching options.</p>
      ) : stepper ? (
        <ul className={styles.stepperList}>
          {visibleRows.map((row) => (
            <li
              key={row.option.id}
              className={styles.stepperRow}
              data-ineligible={!row.option.eligible || undefined}
            >
              <span className={styles.optionLabel}>{row.option.label}</span>
              {!row.option.eligible ? (
                <span className={styles.reason}>{row.option.reason}</span>
              ) : (
                <span className={styles.stepper}>
                  <button
                    type="button"
                    className={styles.step}
                    aria-label={`Remove one ${row.option.label}`}
                    disabled={!row.canDecrement}
                    onClick={() => setSelection((s) => decrement(s, row.option.id))}
                  >
                    −
                  </button>
                  <span className={styles.count}>{row.count}</span>
                  <button
                    type="button"
                    className={styles.step}
                    aria-label={`Add one ${row.option.label}`}
                    disabled={!row.canIncrement}
                    onClick={() => setSelection((s) => increment(decision, s, row.option.id))}
                  >
                    +
                  </button>
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.grid}>
          {visibleRows.map((row) => {
            // In multi-select, once the cap is reached the remaining unselected
            // options are disabled; a single-select stays clickable (radio).
            const capped =
              row.count === 0 && decision.decision.count !== 1 && !row.canIncrement;
            const disabled = !row.option.eligible || capped;
            return (
              <button
                key={row.option.id}
                type="button"
                className={styles.option}
                aria-pressed={row.count > 0}
                data-selected={row.count > 0 || undefined}
                disabled={disabled}
                onClick={() => setSelection((s) => toggle(decision, s, row.option.id))}
              >
                <span className={styles.optionLabel}>{row.option.label}</span>
                {!row.option.eligible && row.option.reason && (
                  <span className={styles.reason}>{row.option.reason}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        className={styles.confirm}
        disabled={!isComplete(decision, selection)}
        onClick={handleConfirm}
      >
        Confirm
      </button>
    </section>
  );
}
