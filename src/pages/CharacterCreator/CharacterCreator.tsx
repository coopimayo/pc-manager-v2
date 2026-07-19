import { useState } from 'react';

import { classes } from '../../data/classes';
import { feats } from '../../data/feats';
import { weapons } from '../../data/items';
import { abilityModifier, grantedFeatCategory } from '../../lib/derive';
import { signed, titleCase } from '../../lib/format';
import type { Ability, Character, Skill } from '../../types';
import type { EquipmentPackage } from '../../types/item';
import styles from './CharacterCreator.module.css';

const abilityOrder: Ability[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
const standardArray = [15, 14, 13, 12, 10, 8];

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function uniqueId(name: string, taken: string[]): string {
  const base = slugify(name) || 'character';
  if (!taken.includes(base)) return base;
  let suffix = 2;
  while (taken.includes(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

function describePackage(pkg: EquipmentPackage): string {
  return [...pkg.items.map((item) => item.name), `${pkg.gold} gp`].join(', ');
}

interface CharacterCreatorProps {
  takenIds: string[];
  onCreate: (character: Character) => void;
  onCancel: () => void;
}

export function CharacterCreator({ takenIds, onCreate, onCancel }: CharacterCreatorProps) {
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [background, setBackground] = useState('');
  const [classId, setClassId] = useState<string | null>(null);
  const [scores, setScores] = useState<Partial<Record<Ability, number>>>({});
  const [skills, setSkills] = useState<Skill[]>([]);
  const [equipmentLabel, setEquipmentLabel] = useState<string | null>(null);
  const [featChoices, setFeatChoices] = useState<Record<string, string>>({});

  const chosen = classes.find((entry) => entry.id === classId);
  const featFeatures = (chosen?.features ?? []).filter(
    (feature) => feature.level === 1 && grantedFeatCategory(feature),
  );
  const equipment = chosen?.startingEquipment.from.find((pkg) => pkg.label === equipmentLabel);
  const assigned = new Set(Object.values(scores));
  const scoresComplete = abilityOrder.every((ability) => scores[ability] !== undefined);

  const ready =
    name.trim() !== '' &&
    chosen !== undefined &&
    scoresComplete &&
    skills.length === chosen.skillProficiencies.choose &&
    equipment !== undefined &&
    featFeatures.every((feature) => featChoices[feature.id] !== undefined);

  function selectClass(id: string) {
    if (id === classId) return;
    setClassId(id);
    setSkills([]);
    setEquipmentLabel(null);
    setFeatChoices({});
  }

  function assignScore(ability: Ability, raw: string) {
    setScores((current) => {
      const next = { ...current };
      if (raw === '') delete next[ability];
      else next[ability] = Number(raw);
      return next;
    });
  }

  function toggleSkill(skill: Skill) {
    setSkills((current) =>
      current.includes(skill) ? current.filter((entry) => entry !== skill) : [...current, skill],
    );
  }

  function create() {
    if (!chosen || !equipment || !scoresComplete) return;
    onCreate({
      id: uniqueId(name, takenIds),
      name: name.trim(),
      speciesId: slugify(species),
      backgroundId: slugify(background),
      classes: [{ classId: chosen.id, level: 1 }],
      abilityScores: scores as Record<Ability, number>,
      skillProficiencies: skills,
      featIds: featFeatures.flatMap((feature) => {
        const featId = featChoices[feature.id];
        return featId ? [featId] : [];
      }),
      weaponIds: equipment.items
        .filter((item) => weapons.some((weapon) => weapon.id === item.id))
        .map((item) => item.id),
    });
  }

  return (
    <main className={styles.page}>
      <div className={styles.topbar}>
        <button type="button" className={styles.back} onClick={onCancel}>
          ← All characters
        </button>
      </div>

      <header className={styles.header}>
        <h1 className={styles.title}>New Character</h1>
        <p className={styles.subtitle}>Build a level 1 character, then open its sheet.</p>
      </header>

      <section className={styles.section}>
        <h2 className={styles.heading}>Identity</h2>
        <div className={styles.fields}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Name</span>
            <input
              className={styles.input}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Bram Stonefist"
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Species</span>
            <input
              className={styles.input}
              value={species}
              onChange={(event) => setSpecies(event.target.value)}
              placeholder="Human"
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Background</span>
            <input
              className={styles.input}
              value={background}
              onChange={(event) => setBackground(event.target.value)}
              placeholder="Soldier"
            />
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Class</h2>
        <ul className={styles.options}>
          {classes.map((entry) => {
            const selected = entry.id === classId;
            return (
              <li key={entry.id}>
                <button
                  type="button"
                  className={selected ? styles.optionSelected : styles.option}
                  aria-pressed={selected}
                  onClick={() => selectClass(entry.id)}
                >
                  <span className={styles.optionName}>{entry.name}</span>
                  <span className={styles.optionDescription}>{entry.description}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Ability Scores</h2>
        <p className={styles.hint}>
          Assign each value of the standard array ({standardArray.join(', ')}) to an ability.
        </p>
        <ul className={styles.abilities}>
          {abilityOrder.map((ability) => {
            const value = scores[ability];
            return (
              <li key={ability} className={styles.ability}>
                <label className={styles.abilityName} htmlFor={`ability-${ability}`}>
                  {ability.toUpperCase()}
                </label>
                <select
                  id={`ability-${ability}`}
                  className={styles.select}
                  value={value ?? ''}
                  onChange={(event) => assignScore(ability, event.target.value)}
                >
                  <option value="">—</option>
                  {standardArray.map((option) => (
                    <option
                      key={option}
                      value={option}
                      disabled={option !== value && assigned.has(option)}
                    >
                      {option}
                    </option>
                  ))}
                </select>
                <span className={styles.abilityModifier}>
                  {value === undefined ? '' : signed(abilityModifier(value))}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {chosen ? (
        <>
          <section className={styles.section}>
            <h2 className={styles.heading}>Skills</h2>
            <p className={styles.hint}>
              Choose {chosen.skillProficiencies.choose} from the {chosen.name} list — {skills.length}{' '}
              of {chosen.skillProficiencies.choose} chosen.
            </p>
            <ul className={styles.skillGrid}>
              {chosen.skillProficiencies.from.map((skill) => {
                const selected = skills.includes(skill);
                const full = skills.length >= chosen.skillProficiencies.choose;
                return (
                  <li key={skill}>
                    <button
                      type="button"
                      className={selected ? styles.toggleSelected : styles.toggle}
                      aria-pressed={selected}
                      disabled={!selected && full}
                      onClick={() => toggleSkill(skill)}
                    >
                      {titleCase(skill)}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.heading}>Starting Equipment</h2>
            <ul className={styles.options}>
              {chosen.startingEquipment.from.map((pkg) => {
                const selected = pkg.label === equipmentLabel;
                return (
                  <li key={pkg.label}>
                    <button
                      type="button"
                      className={selected ? styles.optionSelected : styles.option}
                      aria-pressed={selected}
                      onClick={() => setEquipmentLabel(pkg.label)}
                    >
                      <span className={styles.optionName}>Option {pkg.label}</span>
                      <span className={styles.optionDescription}>{describePackage(pkg)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          {featFeatures.map((feature) => {
            const category = grantedFeatCategory(feature);
            const options = feats.filter((feat) => feat.category === category);
            return (
              <section key={feature.id} className={styles.section}>
                <h2 className={styles.heading}>{feature.name}</h2>
                <p className={styles.hint}>{feature.description}</p>
                <ul className={styles.options}>
                  {options.map((feat) => {
                    const selected = featChoices[feature.id] === feat.id;
                    return (
                      <li key={feat.id}>
                        <button
                          type="button"
                          className={selected ? styles.optionSelected : styles.option}
                          aria-pressed={selected}
                          onClick={() =>
                            setFeatChoices((current) => ({ ...current, [feature.id]: feat.id }))
                          }
                        >
                          <span className={styles.optionName}>{feat.name}</span>
                          <span className={styles.optionDescription}>{feat.description}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </>
      ) : null}

      <div className={styles.footer}>
        <button type="button" className={styles.create} disabled={!ready} onClick={create}>
          Create Character
        </button>
      </div>
    </main>
  );
}
