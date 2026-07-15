import { useMemo } from "react";
import { derive } from "@pc-manager/engine";
import { srdPack } from "@pc-manager/content-srd";
import { type Character } from "../character";
import styles from "./CharacterEditorPage.module.css";

interface Props {
  character: Character | undefined;
  /** The store is still hydrating, so a missing character isn't yet "not found". */
  loading: boolean;
}

/**
 * Scaffold editor. It does not yet edit anything — the generic decision UI and
 * creation flow are steps 2.3/2.4. For now it derives the character's sheet from
 * its build log, which doubles as a smoke test that the web app is correctly
 * wired to @pc-manager/engine and @pc-manager/content-srd.
 */
export function CharacterEditorPage({ character, loading }: Props): React.JSX.Element {
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

      <p className={styles.note}>
        The creation wizard is not built yet (steps 2.3–2.4). This view derives
        the character from its build log — {pendingDecisions.length} decision
        {pendingDecisions.length === 1 ? "" : "s"} pending.
      </p>

      <footer className={styles.attribution}>
        {sheet.attributions.map((attribution, index) => (
          <p key={index}>{attribution}</p>
        ))}
      </footer>
    </section>
  );
}
