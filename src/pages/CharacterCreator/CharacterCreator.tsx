import { useState } from 'react';

import { AbilityAllocator } from '../../components/AbilityAllocator';
import { OptionList } from '../../components/OptionList';
import { SkillToggleGrid } from '../../components/SkillToggleGrid';
import { Stepper } from '../../components/Stepper';
import { backgrounds } from '../../data/backgrounds';
import { classes } from '../../data/classes';
import { feats } from '../../data/feats';
import { weapons } from '../../data/items';
import { species } from '../../data/species';
import { abilityModifier, grantedFeatCategory } from '../../lib/derive';
import { effectOfKind } from '../../lib/effects';
import { signed, titleCase } from '../../lib/format';
import { skillAbilities } from '../../lib/skill-abilities';
import type { Ability, Character, Skill } from '../../types';
import { describePackage, uniqueId } from './index';
import styles from './CharacterCreator.module.css';

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
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [speciesId, setSpeciesId] = useState<string | null>(null);
  const [backgroundId, setBackgroundId] = useState<string | null>(null);
  const [bonuses, setBonuses] = useState<Partial<Record<Ability, number>>>({});
  const [classId, setClassId] = useState<string | null>(null);
  const [scores, setScores] = useState<Partial<Record<Ability, number>>>({});
  const [skills, setSkills] = useState<Skill[]>([]);
  const [featSkills, setFeatSkills] = useState<Skill[]>([]);
  const [speciesSkills, setSpeciesSkills] = useState<Skill[]>([]);
  const [equipmentLabel, setEquipmentLabel] = useState<string | null>(null);
  const [featChoices, setFeatChoices] = useState<Record<string, string>>({});

  const chosenSpecies = species.find((entry) => entry.id === speciesId);
  const speciesEffects = (chosenSpecies?.traits ?? []).flatMap((trait) => trait.effects);
  const speciesSkillChoice = effectOfKind(speciesEffects, 'skillProficiencyChoice');
  const chosenBackground = backgrounds.find((entry) => entry.id === backgroundId);
  const backgroundFeat = feats.find((entry) => entry.id === chosenBackground?.featId);
  const featSkillChoice = effectOfKind(backgroundFeat?.effects ?? [], 'skillProficiencyChoice');
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

  const basicsDone = name.trim() !== '' && scoresComplete;
  const speciesDone =
    chosenSpecies !== undefined &&
    (speciesSkillChoice === undefined || speciesSkills.length === speciesSkillChoice.count);
  const backgroundDone =
    chosenBackground !== undefined &&
    bonusRemaining === 0 &&
    (featSkillChoice === undefined || featSkills.length === featSkillChoice.count);
  const classDone =
    chosen !== undefined &&
    skills.length === chosen.skillProficiencies.choose &&
    equipment !== undefined &&
    featFeatures.every((feature) => featChoices[feature.id] !== undefined);
  const ready = basicsDone && speciesDone && backgroundDone && classDone;

  const steps = [
    { label: 'Basics', done: basicsDone },
    { label: 'Species', done: speciesDone },
    { label: 'Background', done: backgroundDone },
    { label: 'Class', done: classDone },
    { label: 'Review', done: ready },
  ];
  const lastStep = steps.length - 1;
  const currentDone = steps[step]?.done ?? false;

  function goTo(index: number) {
    if (index <= step || steps.slice(0, index).every((entry) => entry.done)) setStep(index);
  }

  function selectSpecies(id: string) {
    if (id === speciesId) return;
    setSpeciesId(id);
    setSpeciesSkills([]);
  }

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

  function assignScore(ability: Ability, raw: string) {
    setScores((current) => {
      const next = { ...current };
      if (raw === '') delete next[ability];
      else next[ability] = Number(raw);
      return next;
    });
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
      skillProficiencies: [...new Set([...skills, ...featSkills, ...speciesSkills])],
      featIds: featFeatures.flatMap((feature) => {
        const featId = featChoices[feature.id];
        return featId ? [featId] : [];
      }),
      weaponIds: equipment.items
        .filter((item) => weapons.some((weapon) => weapon.id === item.id))
        .map((item) => item.id),
      spellbook: { knownSpellIds: [] },
    });
  }

  const bonusSummary = abilityOrder
    .filter((ability) => (bonuses[ability] ?? 0) > 0)
    .map((ability) => `+${bonuses[ability]} ${ability.toUpperCase()}`)
    .join(', ');
  const featChoiceNames = featFeatures
    .map((feature) => feats.find((feat) => feat.id === featChoices[feature.id])?.name)
    .filter((entry): entry is string => entry !== undefined)
    .join(', ');
  const classSummary = [
    chosen ? `${chosen.name} 1` : undefined,
    skills.length ? skills.map(titleCase).join(', ') : undefined,
    equipmentLabel ? `Option ${equipmentLabel}` : undefined,
    featChoiceNames || undefined,
  ]
    .filter(Boolean)
    .join(' · ');

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

      <Stepper steps={steps} current={step} onGo={goTo} />

      {step === 0 ? (
        <>
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
            <h2 className={styles.heading}>Ability Scores</h2>
            <p className={styles.hint}>
              Assign each value of the standard array ({standardArray.join(', ')}) to an ability.
              Background increases fold into the totals.
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
        </>
      ) : null}

      {step === 1 ? (
        <section className={styles.section}>
          <h2 className={styles.heading}>Species</h2>
          <OptionList options={species} selectedId={speciesId} onSelect={selectSpecies} />
          {chosenSpecies && speciesSkillChoice ? (
            <div className={styles.allocation}>
              <p className={styles.hint}>
                {chosenSpecies.name} grants proficiency in{' '}
                {speciesSkillChoice.from
                  ? `${speciesSkillChoice.count} of ${speciesSkillChoice.from.map(titleCase).join(', ')}`
                  : `any ${speciesSkillChoice.count} skill${speciesSkillChoice.count === 1 ? '' : 's'}`}{' '}
                — {speciesSkills.length} of {speciesSkillChoice.count} chosen.
              </p>
              <SkillToggleGrid
                options={speciesSkillChoice.from ?? allSkills}
                selected={speciesSkills}
                locked={[...grantedSkills, ...skills, ...featSkills]}
                max={speciesSkillChoice.count}
                onChange={setSpeciesSkills}
              />
            </div>
          ) : null}
        </section>
      ) : null}

      {step === 2 ? (
        <section className={styles.section}>
          <h2 className={styles.heading}>Background</h2>
          <OptionList options={backgrounds} selectedId={backgroundId} onSelect={selectBackground} />
          {chosenBackground ? (
            <div className={styles.allocation}>
              <p className={styles.hint}>
                Increase one {chosenBackground.name} ability by 2 and another by 1, or all three by
                1 — {bonusRemaining} point{bonusRemaining === 1 ? '' : 's'} left.
              </p>
              <AbilityAllocator
                abilities={chosenBackground.abilityScores}
                allocation={bonuses}
                valueLabel={(_, added) => (added > 0 ? `+${added}` : '—')}
                canIncrease={(_, added) => bonusRemaining > 0 && added < backgroundMaxPerAbility}
                onChange={setBonuses}
              />
            </div>
          ) : null}
          {backgroundFeat && featSkillChoice ? (
            <div className={styles.allocation}>
              <p className={styles.hint}>
                {backgroundFeat.name} grants proficiency in any {featSkillChoice.count} skills —{' '}
                {featSkills.length} of {featSkillChoice.count} chosen.
              </p>
              <SkillToggleGrid
                options={allSkills}
                selected={featSkills}
                locked={[...grantedSkills, ...skills, ...speciesSkills]}
                max={featSkillChoice.count}
                onChange={setFeatSkills}
              />
            </div>
          ) : null}
        </section>
      ) : null}

      {step === 3 ? (
        <>
          <section className={styles.section}>
            <h2 className={styles.heading}>Class</h2>
            <OptionList options={classes} selectedId={classId} onSelect={selectClass} />
          </section>

          {chosen ? (
            <>
              <section className={styles.section}>
                <h2 className={styles.heading}>Skills</h2>
                <p className={styles.hint}>
                  Choose {chosen.skillProficiencies.choose} from the {chosen.name} list —{' '}
                  {skills.length} of {chosen.skillProficiencies.choose} chosen.
                  {chosenBackground &&
                  chosen.skillProficiencies.from.some((skill) => grantedSkills.includes(skill))
                    ? ` ${chosenBackground.name} already grants ${chosen.skillProficiencies.from
                        .filter((skill) => grantedSkills.includes(skill))
                        .map(titleCase)
                        .join(' and ')}.`
                    : ''}
                </p>
                <SkillToggleGrid
                  options={chosen.skillProficiencies.from}
                  selected={skills}
                  locked={[...grantedSkills, ...featSkills, ...speciesSkills]}
                  max={chosen.skillProficiencies.choose}
                  onChange={setSkills}
                />
              </section>

              <section className={styles.section}>
                <h2 className={styles.heading}>Starting Equipment</h2>
                <OptionList
                  options={chosen.startingEquipment.from.map((pkg) => ({
                    id: pkg.label,
                    name: `Option ${pkg.label}`,
                    description: describePackage(pkg),
                  }))}
                  selectedId={equipmentLabel}
                  onSelect={setEquipmentLabel}
                />
              </section>

              {featFeatures.map((feature) => (
                <section key={feature.id} className={styles.section}>
                  <h2 className={styles.heading}>{feature.name}</h2>
                  <p className={styles.hint}>{feature.description}</p>
                  <OptionList
                    options={feats.filter((feat) => feat.category === grantedFeatCategory(feature))}
                    selectedId={featChoices[feature.id] ?? null}
                    onSelect={(featId) =>
                      setFeatChoices((current) => ({ ...current, [feature.id]: featId }))
                    }
                  />
                </section>
              ))}
            </>
          ) : null}
        </>
      ) : null}

      {step === 4 ? (
        <section className={styles.section}>
          <h2 className={styles.heading}>Review</h2>
          <dl className={styles.review}>
            <div className={styles.reviewRow}>
              <dt className={styles.reviewTerm}>Name</dt>
              <dd className={styles.reviewValue}>{name.trim() || '—'}</dd>
            </div>
            <div className={styles.reviewRow}>
              <dt className={styles.reviewTerm}>Species</dt>
              <dd className={styles.reviewValue}>
                {[chosenSpecies?.name, speciesSkills.map(titleCase).join(', ')]
                  .filter(Boolean)
                  .join(' · ') || '—'}
              </dd>
            </div>
            <div className={styles.reviewRow}>
              <dt className={styles.reviewTerm}>Background</dt>
              <dd className={styles.reviewValue}>
                {[chosenBackground?.name, bonusSummary, featSkills.map(titleCase).join(', ')]
                  .filter(Boolean)
                  .join(' · ') || '—'}
              </dd>
            </div>
            <div className={styles.reviewRow}>
              <dt className={styles.reviewTerm}>Class</dt>
              <dd className={styles.reviewValue}>{classSummary || '—'}</dd>
            </div>
          </dl>
          <ul className={styles.abilities}>
            {abilityOrder.map((ability) => {
              const base = scores[ability];
              const bonus = bonuses[ability] ?? 0;
              const total = base === undefined ? undefined : Math.min(20, base + bonus);
              return (
                <li key={ability} className={styles.ability}>
                  <span className={styles.abilityName}>{ability.toUpperCase()}</span>
                  <span>{base === undefined ? '—' : `${base}${bonus > 0 ? ` + ${bonus}` : ''}`}</span>
                  <span className={styles.abilityModifier}>
                    {total === undefined ? '' : `${total} · ${signed(abilityModifier(total))}`}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <div className={styles.nav}>
        <button
          type="button"
          className={styles.secondary}
          disabled={step === 0}
          onClick={() => setStep((current) => Math.max(0, current - 1))}
        >
          ← Back
        </button>
        {step < lastStep ? (
          <button
            type="button"
            className={styles.create}
            disabled={!currentDone}
            onClick={() => setStep((current) => Math.min(lastStep, current + 1))}
          >
            Next →
          </button>
        ) : (
          <button type="button" className={styles.create} disabled={!ready} onClick={create}>
            Create Character
          </button>
        )}
      </div>
    </main>
  );
}
