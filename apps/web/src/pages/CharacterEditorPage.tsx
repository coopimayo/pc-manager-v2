import { useMemo } from "react";
import { derive } from "@pc-manager/engine";
import { srdPack } from "@pc-manager/content-srd";
import { type Character } from "../character";
import { DecisionCard } from "../components/DecisionCard";
import styles from "./CharacterEditorPage.module.css";

interface Props {
  character: Character | undefined;
  /** The store is still hydrating, so a missing character isn't yet "not found". */
  loading: boolean;
  /** Resolve a pending decision: append `decisionResolved` and re-derive. */
  onResolveDecision: (instanceId: string, optionIds: string[]) => void;
}

/**
 * Character editor. The creation stepper and full sheet are steps 2.4/2.5; for
 * now this is the generic decision surface (step 2.3): it derives the sheet from
 * the build log and renders every pending decision as a <DecisionCard>. Resolving
 * one appends an event, re-derives, and any newly-opened decision (e.g. Elf →
 * lineage) appears in place — all with no content-specific code here.
 */
export function CharacterEditorPage({
  character,
  loading,
  onResolveDecision,
}: Props): React.JSX.Element {
  const result = useMemo(() => {
    if (!character) return undefined;
    return derive([srdPack], character.buildLog);
  }, [character]);

  if (!character || !result) {
    return (
      <section className={styles.page}>
        <a className={styles.back} href="#/">
          ← Back to characters
        </a>
        <p className={styles.missing}>{loading ? "Loading…" : "Character not found."}</p>
      </section>
    );
  }

  const { sheet, pendingDecisions } = result;

  return (
    <section className={styles.page}>
      <a className={styles.back} href="#/">
        ← Back to characters
      </a>

      <h1 className={styles.heading}>{sheet.name}</h1>
      <p className={styles.subhead}>Level {sheet.level}</p>

      <h2 className={styles.sectionHeading}>
        Decisions
        {pendingDecisions.length > 0 && (
          <span className={styles.badge}>{pendingDecisions.length}</span>
        )}
      </h2>

      {pendingDecisions.length === 0 ? (
        <p className={styles.note}>No decisions pending.</p>
      ) : (
        <div className={styles.decisions}>
          {pendingDecisions.map((decision) => (
            <DecisionCard
              key={decision.instanceId}
              decision={decision}
              onResolve={onResolveDecision}
            />
          ))}
        </div>
      )}

      <footer className={styles.attribution}>
        {sheet.attributions.map((attribution, index) => (
          <p key={index}>{attribution}</p>
        ))}
      </footer>
    </section>
  );
}
