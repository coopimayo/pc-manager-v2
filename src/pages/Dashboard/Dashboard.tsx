import { backgrounds } from '../../data/backgrounds';
import { classes, subclasses } from '../../data/classes';
import { species } from '../../data/species';
import { derive } from '../../lib/derive';
import type { Character } from '../../types';
import styles from './Dashboard.module.css';

interface DashboardProps {
  characters: Character[];
  onSelect: (id: string) => void;
  onCreate: () => void;
}

export function Dashboard({ characters, onSelect, onCreate }: DashboardProps) {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Characters</h1>
          <p className={styles.subtitle}>
            {characters.length} {characters.length === 1 ? 'character' : 'characters'}
          </p>
        </div>
        <button type="button" className={styles.create} onClick={onCreate}>
          New Character
        </button>
      </header>

      {characters.length === 0 ? (
        <p className={styles.empty}>No characters yet.</p>
      ) : (
        <ul className={styles.grid}>
          {characters.map((character) => {
            const sheet = derive(character, { classes, subclasses, species, backgrounds });
            const summary = sheet.classes.map((entry) => `${entry.name} ${entry.level}`).join(' / ');

            return (
              <li key={character.id}>
                <button
                  type="button"
                  className={styles.card}
                  onClick={() => onSelect(character.id)}
                >
                  <span className={styles.name}>{sheet.name}</span>
                  <span className={styles.summary}>{summary || 'Unknown class'}</span>
                  <span className={styles.meta}>
                    <span>Level {sheet.level}</span>
                    <span>{sheet.hitPoints} HP</span>
                    <span>
                      {sheet.abilities.length}{' '}
                      {sheet.abilities.length === 1 ? 'ability' : 'abilities'}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
