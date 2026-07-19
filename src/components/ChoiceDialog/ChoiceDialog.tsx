import { useId } from 'react';
import type { ReactNode } from 'react';

import { useEscape } from '../../hooks/useEscape';
import styles from './ChoiceDialog.module.css';

interface ChoiceDialogProps {
  title: string;
  subtitle: string;
  confirmDisabled: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children: ReactNode;
}

export function ChoiceDialog({
  title,
  subtitle,
  confirmDisabled,
  onConfirm,
  onCancel,
  children,
}: ChoiceDialogProps) {
  const titleId = useId();
  useEscape(onCancel);

  return (
    <div className={styles.overlay} role="presentation" onClick={onCancel}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <p className={styles.subtitle}>{subtitle}</p>

        <div className={styles.body}>{children}</div>

        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.confirm}
            disabled={confirmDisabled}
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
