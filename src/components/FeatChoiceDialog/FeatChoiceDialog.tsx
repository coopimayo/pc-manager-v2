import { useState } from 'react';

import { effectOfKind } from '../../lib/effects';
import { skillAbilities } from '../../lib/skill-abilities';
import type { Ability, Feat, Skill } from '../../types';
import { AbilityAllocator } from '../AbilityAllocator';
import { ChoiceDialog } from '../ChoiceDialog';
import { OptionList } from '../OptionList';
import { SkillToggleGrid } from '../SkillToggleGrid';
import styles from './FeatChoiceDialog.module.css';

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

  function select(featId: string) {
    setSelectedId(featId);
    setAllocation({});
    setSkills([]);
  }

  const selectedFeat = options.find((feat) => feat.id === selectedId);
  const choice = effectOfKind(selectedFeat?.effects ?? [], 'abilityScoreChoice');
  const skillChoice = effectOfKind(selectedFeat?.effects ?? [], 'skillProficiencyChoice');
  const spent = abilityOrder.reduce((total, ability) => total + (allocation[ability] ?? 0), 0);
  const remaining = choice ? choice.points - spent : 0;
  const ready =
    selectedId !== null &&
    (!choice || remaining === 0) &&
    (!skillChoice || skills.length === skillChoice.count);

  function confirm() {
    if (!selectedId) return;
    onChoose(selectedId, choice ? allocation : undefined, skillChoice ? skills : undefined);
  }

  return (
    <ChoiceDialog
      title={featureName}
      subtitle="Choose a feat to gain."
      confirmDisabled={!ready}
      onConfirm={confirm}
      onCancel={onCancel}
    >
      <OptionList options={options} selectedId={selectedId} onSelect={select} />

      {choice ? (
        <div>
          <p className={styles.allocationLabel}>
            Distribute your increases — {remaining} point{remaining === 1 ? '' : 's'} left
          </p>
          <AbilityAllocator
            abilities={abilityOrder}
            allocation={allocation}
            valueLabel={(ability, added) =>
              `${abilityScores[ability]}${added > 0 ? ` → ${abilityScores[ability] + added}` : ''}`
            }
            canIncrease={(ability, added) =>
              remaining > 0 && added < choice.maxPerAbility && abilityScores[ability] + added < 20
            }
            onChange={setAllocation}
          />
        </div>
      ) : null}

      {skillChoice ? (
        <div>
          <p className={styles.allocationLabel}>
            Choose {skillChoice.count} skills — {skills.length} of {skillChoice.count} chosen.
          </p>
          <SkillToggleGrid
            options={allSkills}
            selected={skills}
            locked={proficientSkills}
            max={skillChoice.count}
            onChange={setSkills}
          />
        </div>
      ) : null}
    </ChoiceDialog>
  );
}
