import { useEffect, useState } from 'react';

import type { Feat } from '../../types';
import styles from './FeatChoiceDialog.module.css';

interface FeatChoiceDialogProps {
  featureName: string;
  options: Feat[];
  onChoose: (featId: string) => void;
  onCancel: () => void;
}

export function FeatChoiceDialog({ featureName, options, onChoose, onCancel }: FeatChoiceDialogProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  return (
    <div className={styles.overlay} role="presentation" onClick={onCancel}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feat-choice-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="feat-choice-title" className={styles.title}>
          {featureName}
        </h2>
        <p className={styles.subtitle}>Choose a feat to gain.</p>

        <ul className={styles.options}>
          {options.map((feat) => {
            const selected = feat.id === selectedId;
            return (
              <li key={feat.id}>
                <button
                  type="button"
                  className={selected ? styles.optionSelected : styles.option}
                  aria-pressed={selected}
                  onClick={() => setSelectedId(feat.id)}
                >
                  <span className={styles.optionName}>{feat.name}</span>
                  <span className={styles.optionDescription}>{feat.description}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.confirm}
            disabled={selectedId === null}
            onClick={() => selectedId && onChoose(selectedId)}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
