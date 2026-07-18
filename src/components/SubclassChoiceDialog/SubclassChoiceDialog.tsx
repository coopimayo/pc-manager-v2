import { useEffect, useState } from 'react';

import type { Subclass } from '../../types/class';
import styles from './SubclassChoiceDialog.module.css';

interface SubclassChoiceDialogProps {
  featureName: string;
  options: Subclass[];
  onChoose: (subclassId: string) => void;
  onCancel: () => void;
}

export function SubclassChoiceDialog({
  featureName,
  options,
  onChoose,
  onCancel,
}: SubclassChoiceDialogProps) {
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
        aria-labelledby="subclass-choice-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="subclass-choice-title" className={styles.title}>
          {featureName}
        </h2>
        <p className={styles.subtitle}>Choose a subclass.</p>

        <ul className={styles.options}>
          {options.map((subclass) => {
            const selected = subclass.id === selectedId;
            return (
              <li key={subclass.id}>
                <button
                  type="button"
                  className={selected ? styles.optionSelected : styles.option}
                  aria-pressed={selected}
                  onClick={() => setSelectedId(subclass.id)}
                >
                  <span className={styles.optionName}>{subclass.name}</span>
                  <span className={styles.optionDescription}>{subclass.description}</span>
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
