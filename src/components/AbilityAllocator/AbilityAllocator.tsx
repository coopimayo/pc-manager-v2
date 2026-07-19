import type { Ability } from '../../types';
import styles from './AbilityAllocator.module.css';

interface AbilityAllocatorProps {
  abilities: Ability[];
  allocation: Partial<Record<Ability, number>>;
  valueLabel: (ability: Ability, added: number) => string;
  canIncrease: (ability: Ability, added: number) => boolean;
  onChange: (allocation: Partial<Record<Ability, number>>) => void;
}

export function AbilityAllocator({
  abilities,
  allocation,
  valueLabel,
  canIncrease,
  onChange,
}: AbilityAllocatorProps) {
  function step(ability: Ability, delta: number) {
    onChange({ ...allocation, [ability]: (allocation[ability] ?? 0) + delta });
  }

  return (
    <ul className={styles.abilities}>
      {abilities.map((ability) => {
        const added = allocation[ability] ?? 0;
        return (
          <li key={ability} className={styles.ability}>
            <span className={styles.abilityName}>{ability.toUpperCase()}</span>
            <span className={styles.value}>{valueLabel(ability, added)}</span>
            <span className={styles.stepper}>
              <button
                type="button"
                className={styles.step}
                aria-label={`Decrease ${ability.toUpperCase()}`}
                disabled={added <= 0}
                onClick={() => step(ability, -1)}
              >
                −
              </button>
              <button
                type="button"
                className={styles.step}
                aria-label={`Increase ${ability.toUpperCase()}`}
                disabled={!canIncrease(ability, added)}
                onClick={() => step(ability, 1)}
              >
                +
              </button>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
