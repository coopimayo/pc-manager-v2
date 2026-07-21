import styles from './Stepper.module.css';

interface Step {
  label: string;
  done: boolean;
}

interface StepperProps {
  steps: Step[];
  current: number;
  onGo: (index: number) => void;
}

export function Stepper({ steps, current, onGo }: StepperProps) {
  return (
    <ol className={styles.steps}>
      {steps.map((step, index) => {
        const reachable = steps.slice(0, index).every((entry) => entry.done);
        const className =
          index === current ? styles.current : step.done ? styles.done : styles.todo;
        return (
          <li key={step.label} className={styles.step}>
            <button
              type="button"
              className={className}
              aria-current={index === current ? 'step' : undefined}
              disabled={index !== current && !reachable}
              onClick={() => onGo(index)}
            >
              <span className={styles.index}>{index + 1}</span>
              <span className={styles.label}>{step.label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
