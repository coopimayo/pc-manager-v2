import { titleCase } from '../../lib/format';
import type { Skill } from '../../types';
import styles from './SkillToggleGrid.module.css';

interface SkillToggleGridProps {
  options: Skill[];
  selected: Skill[];
  locked: Skill[];
  max: number;
  onChange: (selected: Skill[]) => void;
}

export function SkillToggleGrid({ options, selected, locked, max, onChange }: SkillToggleGridProps) {
  function toggle(skill: Skill) {
    onChange(
      selected.includes(skill)
        ? selected.filter((entry) => entry !== skill)
        : [...selected, skill],
    );
  }

  return (
    <ul className={styles.skillGrid}>
      {options.map((skill) => {
        const isSelected = selected.includes(skill);
        return (
          <li key={skill}>
            <button
              type="button"
              className={isSelected ? styles.toggleSelected : styles.toggle}
              aria-pressed={isSelected}
              disabled={locked.includes(skill) || (!isSelected && selected.length >= max)}
              onClick={() => toggle(skill)}
            >
              {titleCase(skill)}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
