import { useState } from 'react';

import { AbilityAllocator } from '../../components/AbilityAllocator';
import { OptionList } from '../../components/OptionList';
import { SkillToggleGrid } from '../../components/SkillToggleGrid';
import { Stepper } from '../../components/Stepper';
import { backgrounds } from '../../data/backgrounds';
import { classes } from '../../data/classes';
import { feats } from '../../data/feats';
import { weapons } from '../../data/items';
import { species, subspecies } from '../../data/species';
import {
  abilityModifier,
  grantedFeatCategory,
  grantedSpellIds,
  grantsCastingChoice,
} from '../../lib/derive';
import { effectOfKind } from '../../lib/effects';
import { signed, titleCase } from '../../lib/format';
import { skillAbilities } from '../../lib/skill-abilities';
import type { Ability, Character, Skill } from '../../types';
import { describePackage, uniqueId } from './index';
import styles from './CharacterCreator.module.css';

const abilityOrder: Ability[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
const castingAbilities: Ability[] = ['int', 'wis', 'cha'];
const abilityNames: Record<Ability, string> = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma',
};
const allSkills = Object.keys(skillAbilities) as Skill[];
const standardArray = [15, 14, 13, 12, 10, 8];
const backgroundPoints = 3;
const backgroundMaxPerAbility = 2;

type AbilityMethod = 'array' | 'pointBuy';
const pointBuyBudget = 27;
const pointBuyMin = 8;
const pointBuyMax = 15;
const pointBuyCost: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};
const pointBuyCostOf = (score: number) => pointBuyCost[score] ?? 0;
const emptyPointBuy = (): Partial<Record<Ability, number>> =>
  abilityOrder.reduce<Partial<Record<Ability, number>>>((acc, ability) => {
    acc[ability] = pointBuyMin;
    return acc;
  }, {});

interface CharacterCreatorProps {
  takenIds: string[];
  onCreate: (character: Character) => void;
  onCancel: () => void;
}

export function CharacterCreator({ takenIds, onCreate, onCancel }: CharacterCreatorProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [speciesId, setSpeciesId] = useState<string | null>(null);
  const [subspeciesId, setSubspeciesId] = useState<string | null>(null);
  const [castingAbility, setCastingAbility] = useState<Ability | null>(null);
  const [backgroundId, setBackgroundId] = useState<string | null>(null);
  const [bonuses, setBonuses] = useState<Partial<Record<Ability, number>>>({});
  const [classId, setClassId] = useState<string | null>(null);
  const [abilityMethod, setAbilityMethod] = useState<AbilityMethod>('array');
  const [scores, setScores] = useState<Partial<Record<Ability, number>>>({});
  const [skills, setSkills] = useState<Skill[]>([]);
  const [featSkills, setFeatSkills] = useState<Skill[]>([]);
  const [speciesSkills, setSpeciesSkills] = useState<Skill[]>([]);
  const [equipmentLabel, setEquipmentLabel] = useState<string | null>(null);
  const [featChoices, setFeatChoices] = useState<Record<string, string>>({});

  const chosenSpecies = species.find((entry) => entry.id === speciesId);
  const speciesEffects = (chosenSpecies?.traits ?? []).flatMap((trait) => trait.effects);
  const speciesSkillChoice = effectOfKind(speciesEffects, 'skillProficiencyChoice');
  const availableSubspecies = subspecies.filter((entry) => entry.speciesId === speciesId);
  const chosenSubspecies = availableSubspecies.find((entry) => entry.id === subspeciesId);
  const needsCastingAbility = chosenSubspecies
    ? grantsCastingChoice(chosenSubspecies.traits)
    : false;
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
  const pointsSpent = abilityOrder.reduce(
    (total, ability) => total + pointBuyCostOf(scores[ability] ?? pointBuyMin),
    0,
  );
  const pointsRemaining = pointBuyBudget - pointsSpent;
  const abilitiesDone =
    abilityMethod === 'array' ? scoresComplete : scoresComplete && pointsRemaining === 0;
  const grantedSkills = chosenBackground?.skillProficiencies ?? [];
  const bonusSpent = abilityOrder.reduce((total, ability) => total + (bonuses[ability] ?? 0), 0);
  const bonusRemaining = backgroundPoints - bonusSpent;

  const basicsDone = name.trim() !== '' && abilitiesDone;
  const speciesDone =
    chosenSpecies !== undefined &&
    (speciesSkillChoice === undefined || speciesSkills.length === speciesSkillChoice.count) &&
    (availableSubspecies.length === 0 ||
      (chosenSubspecies !== undefined && (!needsCastingAbility || castingAbility !== null)));
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
    { label: 'Species', done: speciesDone },
    { label: 'Background', done: backgroundDone },
    { label: 'Class', done: classDone },
    { label: 'Basics', done: basicsDone },
    { label: 'Review', done: ready },
  ];
  const lastStep = steps.length - 1;
  const currentStep = steps[step]?.label;
  const currentDone = steps[step]?.done ?? false;

  function goTo(index: number) {
    if (index <= step || steps.slice(0, index).every((entry) => entry.done)) setStep(index);
  }

  function selectSpecies(id: string) {
    if (id === speciesId) return;
    setSpeciesId(id);
    setSpeciesSkills([]);
    setSubspeciesId(null);
    setCastingAbility(null);
  }

  function selectSubspecies(id: string) {
    if (id === subspeciesId) return;
    setSubspeciesId(id);
    setCastingAbility(null);
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

  function selectMethod(method: AbilityMethod) {
    if (method === abilityMethod) return;
    setAbilityMethod(method);
    setScores(method === 'pointBuy' ? emptyPointBuy() : {});
  }

  function create() {
    if (!chosen || !chosenSpecies || !chosenBackground || !equipment || !scoresComplete) return;
    const lineageSpells = chosenSubspecies ? grantedSpellIds(chosenSubspecies.traits, 1) : [];
    onCreate({
      id: uniqueId(name, takenIds),
      name: name.trim(),
      speciesId: chosenSpecies.id,
      subspeciesId: chosenSubspecies?.id,
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
      spellbook: {
        castingAbility: castingAbility ?? undefined,
        knownSpellIds: [...new Set(lineageSpells)],
      },
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

      {currentStep === 'Basics' ? (
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
            <div className={styles.methodToggle} role="group" aria-label="Ability score method">
              <button
                type="button"
                className={abilityMethod === 'array' ? styles.methodOptionActive : styles.methodOption}
                aria-pressed={abilityMethod === 'array'}
                onClick={() => selectMethod('array')}
              >
                Standard Array
              </button>
              <button
                type="button"
                className={
                  abilityMethod === 'pointBuy' ? styles.methodOptionActive : styles.methodOption
                }
                aria-pressed={abilityMethod === 'pointBuy'}
                onClick={() => selectMethod('pointBuy')}
              >
                Point Buy
              </button>
            </div>
            {abilityMethod === 'array' ? (
              <>
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
              </>
            ) : (
              <>
                <p className={styles.hint}>
                  Every score starts at {pointBuyMin}. Spend {pointBuyBudget} points to raise them up
                  to {pointBuyMax} (13→14 and 14→15 cost 2 each). Background increases fold into the
                  totals — {pointsRemaining} point{pointsRemaining === 1 ? '' : 's'} left.
                </p>
                <AbilityAllocator
                  abilities={abilityOrder}
                  allocation={scores}
                  valueLabel={(_, score) => `${score} · ${signed(abilityModifier(score))}`}
                  canIncrease={(_, score) =>
                    score < pointBuyMax &&
                    pointBuyCostOf(score + 1) - pointBuyCostOf(score) <= pointsRemaining
                  }
                  canDecrease={(_, score) => score > pointBuyMin}
                  onChange={setScores}
                />
              </>
            )}
          </section>
        </>
      ) : null}

      {currentStep === 'Species' ? (
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
          {chosenSpecies && availableSubspecies.length > 0 ? (
            <div className={styles.allocation}>
              <p className={styles.hint}>Choose your {chosenSpecies.name} lineage.</p>
              <OptionList
                options={availableSubspecies.map((entry) => ({
                  id: entry.id,
                  name: entry.name,
                  description: entry.traits.map((trait) => trait.name).join(' · '),
                }))}
                selectedId={subspeciesId}
                onSelect={selectSubspecies}
              />
              {needsCastingAbility ? (
                <div className={styles.allocation}>
                  <p className={styles.hint}>Choose its spellcasting ability.</p>
                  <OptionList
                    options={castingAbilities.map((ability) => ({
                      id: ability,
                      name: abilityNames[ability],
                      description: ability.toUpperCase(),
                    }))}
                    selectedId={castingAbility}
                    onSelect={(id) => setCastingAbility(id as Ability)}
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

      {currentStep === 'Background' ? (
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

      {currentStep === 'Class' ? (
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

      {currentStep === 'Review' ? (
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
                {[chosenSpecies?.name, chosenSubspecies?.name, speciesSkills.map(titleCase).join(', ')]
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
