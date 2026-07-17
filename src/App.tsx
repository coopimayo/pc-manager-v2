import styles from './App.module.css';
import { exampleFighter } from './data/characters/example-fighter';
import { fighter } from './data/classes/fighter/fighter';
import { derive } from './lib/derive';
import type { Ability } from './types';
import type { Activation, Uses } from './types/effect';

const abilityOrder: Ability[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

const activationLabels: Record<Activation['type'], string> = {
  'action': 'Action',
  'bonus-action': 'Bonus Action',
  'reaction': 'Reaction',
  'free': 'Free',
  'passive': 'Passive',
};

function signed(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}

function titleCase(value: string): string {
  return value.replace(
    /(^|-)([a-z])/g,
    (_, prefix: string, letter: string) => (prefix ? ' ' : '') + letter.toUpperCase(),
  );
}

function describeUses(uses: Uses): string {
  const rules = uses.recharge
    .map((rule) => `${rule.amount === 'all' ? 'all' : rule.amount} on a ${rule.on.replace('-', ' ')}`)
    .join(', ');
  return `${uses.count} uses — regains ${rules}`;
}

export function App() {
  const sheet = derive(exampleFighter, [fighter]);
  const summary = sheet.classes.map((entry) => `${entry.name} ${entry.level}`).join(' / ');

  return (
    <main className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>{sheet.name}</h1>
        <p className={styles.subtitle}>{summary}</p>
      </header>

      <section className={styles.section}>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Level</span>
            <strong className={styles.statValue}>{sheet.level}</strong>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Hit Points</span>
            <strong className={styles.statValue}>{sheet.hitPoints}</strong>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Proficiency</span>
            <strong className={styles.statValue}>{signed(sheet.proficiencyBonus)}</strong>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Ability Scores</h2>
        <ul className={styles.abilities}>
          {abilityOrder.map((ability) => (
            <li key={ability} className={styles.ability}>
              <span className={styles.abilityName}>{ability.toUpperCase()}</span>
              <strong className={styles.abilityScore}>{sheet.abilityScores[ability]}</strong>
              <span className={styles.abilityModifier}>
                {signed(sheet.abilityModifiers[ability])}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Skills</h2>
        <ul className={styles.skills}>
          {sheet.skills.map((entry) => (
            <li
              key={entry.skill}
              className={entry.proficient ? styles.skillProficient : styles.skill}
            >
              <span>{titleCase(entry.skill)}</span>
              <span className={styles.skillAbility}>{entry.ability.toUpperCase()}</span>
              <strong>{signed(entry.modifier)}</strong>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Actions</h2>
        {sheet.abilities.length === 0 ? (
          <p className={styles.empty}>No activatable abilities.</p>
        ) : (
          <ul className={styles.cards}>
            {sheet.abilities.map((ability) => (
              <li key={ability.name} className={styles.card}>
                <div className={styles.cardHead}>
                  <strong>{ability.name}</strong>
                  <span className={styles.badge}>
                    {activationLabels[ability.activation.type]}
                  </span>
                </div>
                <p className={styles.cardBody}>{ability.description}</p>
                {ability.uses ? (
                  <p className={styles.cardMeta}>{describeUses(ability.uses)}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Features</h2>
        <ul className={styles.cards}>
          {sheet.features.map((feature) => (
            <li key={feature.id} className={styles.card}>
              <div className={styles.cardHead}>
                <strong>{feature.name}</strong>
                <span className={styles.badge}>Level {feature.level}</span>
              </div>
              <p className={styles.cardBody}>{feature.description}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
