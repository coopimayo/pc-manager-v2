import { useEffect, useState } from 'react';

import { titleCase } from '../../lib/format';
import { skillAbilities } from '../../lib/skill-abilities';
import type { Ability, Effect, Feat, Skill } from '../../types';
import styles from './FeatChoiceDialog.module.css';

type AbilityScoreChoice = Extract<Effect, { kind: 'abilityScoreChoice' }>;
type SkillProficiencyChoice = Extract<Effect, { kind: 'skillProficiencyChoice' }>;

const abilityOrder: Ability[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
const allSkills = Object.keys(skillAbilities) as Skill[];

interface FeatChoiceDialogProps {
  featureName: string;
  options: Feat[];
  abilityScores: Record<Ability, number>;
  proficientSkills: Skill[];
  onChoose: (
    featId: string,
    abilityScoreIncreases?: Partial<Record<Ability, number>>,
    skillProficiencies?: Skill[],
  ) => void;
  onCancel: () => void;
}

function abilityScoreChoiceOf(feat: Feat | undefined): AbilityScoreChoice | undefined {
  return feat?.effects.find(
    (effect): effect is AbilityScoreChoice => effect.kind === 'abilityScoreChoice',
  );
}

function skillProficiencyChoiceOf(feat: Feat | undefined): SkillProficiencyChoice | undefined {
  return feat?.effects.find(
    (effect): effect is SkillProficiencyChoice => effect.kind === 'skillProficiencyChoice',
  );
}

export function FeatChoiceDialog({
  featureName,
  options,
  abilityScores,
  proficientSkills,
  onChoose,
  onCancel,
}: FeatChoiceDialogProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [allocation, setAllocation] = useState<Partial<Record<Ability, number>>>({});
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  function select(featId: string) {
    setSelectedId(featId);
    setAllocation({});
    setSkills([]);
  }

  const selectedFeat = options.find((feat) => feat.id === selectedId);
  const choice = abilityScoreChoiceOf(selectedFeat);
  const skillChoice = skillProficiencyChoiceOf(selectedFeat);
  const spent = abilityOrder.reduce((total, ability) => total + (allocation[ability] ?? 0), 0);
  const remaining = choice ? choice.points - spent : 0;
  const ready =
    selectedId !== null &&
    (!choice || remaining === 0) &&
    (!skillChoice || skills.length === skillChoice.count);

  function step(ability: Ability, delta: number) {
    setAllocation((current) => ({ ...current, [ability]: (current[ability] ?? 0) + delta }));
  }

  function toggleSkill(skill: Skill) {
    setSkills((current) =>
      current.includes(skill) ? current.filter((entry) => entry !== skill) : [...current, skill],
    );
  }

  function confirm() {
    if (!selectedId) return;
    onChoose(selectedId, choice ? allocation : undefined, skillChoice ? skills : undefined);
  }

  return (
    <div className={styles.overlay} role="presentation" onClick={onCancel}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feat-choice-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="feat-choice-title" className={styles.title}>
          {featureName}
        </h2>
        <p className={styles.subtitle}>Choose a feat to gain.</p>

        <ul className={styles.options}>
          {options.map((feat) => {
            const selected = feat.id === selectedId;
            return (
              <li key={feat.id}>
                <button
                  type="button"
                  className={selected ? styles.optionSelected : styles.option}
                  aria-pressed={selected}
                  onClick={() => select(feat.id)}
                >
                  <span className={styles.optionName}>{feat.name}</span>
                  <span className={styles.optionDescription}>{feat.description}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {choice ? (
          <div className={styles.allocation}>
            <p className={styles.allocationLabel}>
              Distribute your increases — {remaining} point{remaining === 1 ? '' : 's'} left
            </p>
            <ul className={styles.abilities}>
              {abilityOrder.map((ability) => {
                const added = allocation[ability] ?? 0;
                const next = abilityScores[ability] + added;
                const canAdd = remaining > 0 && added < choice.maxPerAbility && next < 20;
                return (
                  <li key={ability} className={styles.ability}>
                    <span className={styles.abilityName}>{ability.toUpperCase()}</span>
                    <span className={styles.abilityScore}>
                      {abilityScores[ability]}
                      {added > 0 ? ` → ${next}` : ''}
                    </span>
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
                        disabled={!canAdd}
                        onClick={() => step(ability, 1)}
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

        {skillChoice ? (
          <div className={styles.allocation}>
            <p className={styles.allocationLabel}>
              Choose {skillChoice.count} skills — {skills.length} of {skillChoice.count} chosen.
            </p>
            <ul className={styles.skillGrid}>
              {allSkills.map((skill) => {
                const selected = skills.includes(skill);
                const full = skills.length >= skillChoice.count;
                return (
                  <li key={skill}>
                    <button
                      type="button"
                      className={selected ? styles.toggleSelected : styles.toggle}
                      aria-pressed={selected}
                      disabled={proficientSkills.includes(skill) || (!selected && full)}
                      onClick={() => toggleSkill(skill)}
                    >
                      {titleCase(skill)}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className={styles.confirm} disabled={!ready} onClick={confirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
