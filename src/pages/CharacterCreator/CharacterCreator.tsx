import { useState } from 'react';

import { backgrounds } from '../../data/backgrounds';
import { classes } from '../../data/classes';
import { feats } from '../../data/feats';
import { weapons } from '../../data/items';
import { species } from '../../data/species';
import { abilityModifier, grantedFeatCategory } from '../../lib/derive';
import { signed, titleCase } from '../../lib/format';
import { skillAbilities } from '../../lib/skill-abilities';
import type { Ability, Character, Effect, Skill } from '../../types';
import { describePackage, uniqueId } from './index';
import styles from './CharacterCreator.module.css';

type SkillProficiencyChoice = Extract<Effect, { kind: 'skillProficiencyChoice' }>;

const abilityOrder: Ability[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
const allSkills = Object.keys(skillAbilities) as Skill[];
const standardArray = [15, 14, 13, 12, 10, 8];
const backgroundPoints = 3;
const backgroundMaxPerAbility = 2;

interface CharacterCreatorProps {
  takenIds: string[];
  onCreate: (character: Character) => void;
  onCancel: () => void;
}

export function CharacterCreator({ takenIds, onCreate, onCancel }: CharacterCreatorProps) {
  const [name, setName] = useState('');
  const [speciesId, setSpeciesId] = useState<string | null>(null);
  const [backgroundId, setBackgroundId] = useState<string | null>(null);
  const [bonuses, setBonuses] = useState<Partial<Record<Ability, number>>>({});
  const [classId, setClassId] = useState<string | null>(null);
  const [scores, setScores] = useState<Partial<Record<Ability, number>>>({});
  const [skills, setSkills] = useState<Skill[]>([]);
  const [featSkills, setFeatSkills] = useState<Skill[]>([]);
  const [equipmentLabel, setEquipmentLabel] = useState<string | null>(null);
  const [featChoices, setFeatChoices] = useState<Record<string, string>>({});

  const chosenSpecies = species.find((entry) => entry.id === speciesId);
  const chosenBackground = backgrounds.find((entry) => entry.id === backgroundId);
  const backgroundFeat = feats.find((entry) => entry.id === chosenBackground?.featId);
  const featSkillChoice = backgroundFeat?.effects.find(
    (effect): effect is SkillProficiencyChoice => effect.kind === 'skillProficiencyChoice',
  );
  const chosen = classes.find((entry) => entry.id === classId);
  const featFeatures = (chosen?.features ?? []).filter(
    (feature) => feature.level === 1 && grantedFeatCategory(feature),
  );
  const equipment = chosen?.startingEquipment.from.find((pkg) => pkg.label === equipmentLabel);
  const assigned = new Set(Object.values(scores));
  const scoresComplete = abilityOrder.every((ability) => scores[ability] !== undefined);
  const grantedSkills = chosenBackground?.skillProficiencies ?? [];
  const bonusSpent = abilityOrder.reduce((total, ability) => total + (bonuses[ability] ?? 0), 0);
  const bonusRemaining = backgroundPoints - bonusSpent;

  const ready =
    name.trim() !== '' &&
    chosenSpecies !== undefined &&
    chosenBackground !== undefined &&
    bonusRemaining === 0 &&
    chosen !== undefined &&
    scoresComplete &&
    skills.length === chosen.skillProficiencies.choose &&
    (featSkillChoice === undefined || featSkills.length === featSkillChoice.count) &&
    equipment !== undefined &&
    featFeatures.every((feature) => featChoices[feature.id] !== undefined);

  function selectBackground(id: string) {
    if (id === backgroundId) return;
    setBackgroundId(id);
    setBonuses({});
    setFeatSkills([]);
    const granted = backgrounds.find((entry) => entry.id === id)?.skillProficiencies ?? [];
    setSkills((current) => current.filter((skill) => !granted.includes(skill)));
  }

  function selectClass(id: string) {
    if (id === classId) return;
    setClassId(id);
    setSkills([]);
    setEquipmentLabel(null);
    setFeatChoices({});
  }

  function stepBonus(ability: Ability, delta: number) {
    setBonuses((current) => ({ ...current, [ability]: (current[ability] ?? 0) + delta }));
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

  function toggleFeatSkill(skill: Skill) {
    setFeatSkills((current) =>
      current.includes(skill) ? current.filter((entry) => entry !== skill) : [...current, skill],
    );
  }

  function create() {
    if (!chosen || !chosenSpecies || !chosenBackground || !equipment || !scoresComplete) return;
    onCreate({
      id: uniqueId(name, takenIds),
      name: name.trim(),
      speciesId: chosenSpecies.id,
      backgroundId: chosenBackground.id,
      classes: [{ classId: chosen.id, level: 1 }],
      abilityScores: scores as Record<Ability, number>,
      abilityScoreIncreases: { ...bonuses },
      skillProficiencies: [...new Set([...skills, ...featSkills])],
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
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Species</h2>
        <ul className={styles.options}>
          {species.map((entry) => {
            const selected = entry.id === speciesId;
            return (
              <li key={entry.id}>
                <button
                  type="button"
                  className={selected ? styles.optionSelected : styles.option}
                  aria-pressed={selected}
                  onClick={() => setSpeciesId(entry.id)}
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
        <h2 className={styles.heading}>Background</h2>
        <ul className={styles.options}>
          {backgrounds.map((entry) => {
            const selected = entry.id === backgroundId;
            return (
              <li key={entry.id}>
                <button
                  type="button"
                  className={selected ? styles.optionSelected : styles.option}
                  aria-pressed={selected}
                  onClick={() => selectBackground(entry.id)}
                >
                  <span className={styles.optionName}>{entry.name}</span>
                  <span className={styles.optionDescription}>{entry.description}</span>
                </button>
              </li>
            );
          })}
        </ul>
        {chosenBackground ? (
          <div className={styles.allocation}>
            <p className={styles.hint}>
              Increase one {chosenBackground.name} ability by 2 and another by 1, or all three by 1 —{' '}
              {bonusRemaining} point{bonusRemaining === 1 ? '' : 's'} left.
            </p>
            <ul className={styles.abilities}>
              {chosenBackground.abilityScores.map((ability) => {
                const added = bonuses[ability] ?? 0;
                return (
                  <li key={ability} className={styles.ability}>
                    <span className={styles.abilityName}>{ability.toUpperCase()}</span>
                    <span className={styles.bonusValue}>{added > 0 ? `+${added}` : '—'}</span>
                    <span className={styles.stepper}>
                      <button
                        type="button"
                        className={styles.step}
                        aria-label={`Decrease ${ability.toUpperCase()}`}
                        disabled={added <= 0}
                        onClick={() => stepBonus(ability, -1)}
                      >
                        −
                      </button>
                      <button
                        type="button"
                        className={styles.step}
                        aria-label={`Increase ${ability.toUpperCase()}`}
                        disabled={bonusRemaining <= 0 || added >= backgroundMaxPerAbility}
                        onClick={() => stepBonus(ability, 1)}
                      >
                        +
                      </button>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
        {backgroundFeat && featSkillChoice ? (
          <div className={styles.allocation}>
            <p className={styles.hint}>
              {backgroundFeat.name} grants proficiency in any {featSkillChoice.count} skills —{' '}
              {featSkills.length} of {featSkillChoice.count} chosen.
            </p>
            <ul className={styles.skillGrid}>
              {allSkills.map((skill) => {
                const selected = featSkills.includes(skill);
                const full = featSkills.length >= featSkillChoice.count;
                return (
                  <li key={skill}>
                    <button
                      type="button"
                      className={selected ? styles.toggleSelected : styles.toggle}
                      aria-pressed={selected}
                      disabled={
                        grantedSkills.includes(skill) ||
                        skills.includes(skill) ||
                        (!selected && full)
                      }
                      onClick={() => toggleFeatSkill(skill)}
                    >
                      {titleCase(skill)}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
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
          Background increases fold into the totals.
        </p>
        <ul className={styles.abilities}>
          {abilityOrder.map((ability) => {
            const value = scores[ability];
            const bonus = bonuses[ability] ?? 0;
            const total = value === undefined ? undefined : Math.min(20, value + bonus);
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
                  {total === undefined
                    ? ''
                    : `${bonus > 0 ? `→ ${total} · ` : ''}${signed(abilityModifier(total))}`}
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
              {chosenBackground &&
              chosen.skillProficiencies.from.some((skill) => grantedSkills.includes(skill))
                ? ` ${chosenBackground.name} already grants ${chosen.skillProficiencies.from
                    .filter((skill) => grantedSkills.includes(skill))
                    .map(titleCase)
                    .join(' and ')}.`
                : ''}
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
                      disabled={
                        grantedSkills.includes(skill) ||
                        featSkills.includes(skill) ||
                        (!selected && full)
                      }
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
