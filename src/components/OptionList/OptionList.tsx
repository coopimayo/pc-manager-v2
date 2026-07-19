import styles from './OptionList.module.css';

interface Option {
  id: string;
  name: string;
  description: string;
}

interface OptionListProps {
  options: Option[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function OptionList({ options, selectedId, onSelect }: OptionListProps) {
  return (
    <ul className={styles.options}>
      {options.map((option) => {
        const selected = option.id === selectedId;
        return (
          <li key={option.id}>
            <button
              type="button"
              className={selected ? styles.optionSelected : styles.option}
              aria-pressed={selected}
              onClick={() => onSelect(option.id)}
            >
              <span className={styles.optionName}>{option.name}</span>
              <span className={styles.optionDescription}>{option.description}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
