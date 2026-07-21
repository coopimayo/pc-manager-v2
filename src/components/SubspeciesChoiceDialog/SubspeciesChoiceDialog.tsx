import { useState } from 'react';

import { grantsCastingChoice } from '../../lib/derive';
import { signed } from '../../lib/format';
import type { Ability } from '../../types';
import type { Subspecies } from '../../types/species';
import { ChoiceDialog } from '../ChoiceDialog';
import { OptionList } from '../OptionList';
import styles from './SubspeciesChoiceDialog.module.css';

const castingAbilities: Ability[] = ['int', 'wis', 'cha'];
const abilityNames: Record<Ability, string> = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma',
};

interface SubspeciesChoiceDialogProps {
  speciesName: string;
  options: Subspecies[];
  abilityModifiers: Record<Ability, number>;
  proficiencyBonus: number;
  onChoose: (subspeciesId: string, castingAbility?: Ability) => void;
  onCancel: () => void;
}

export function SubspeciesChoiceDialog({
  speciesName,
  options,
  abilityModifiers,
  proficiencyBonus,
  onChoose,
  onCancel,
}: SubspeciesChoiceDialogProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [castingAbility, setCastingAbility] = useState<Ability | null>(null);

  function select(id: string) {
    setSelectedId(id);
    setCastingAbility(null);
  }

  const listOptions = options.map((option) => ({
    id: option.id,
    name: option.name,
    description: option.traits.map((trait) => trait.name).join(' · '),
  }));

  const selected = options.find((option) => option.id === selectedId);
  const needsAbility = selected ? grantsCastingChoice(selected.traits) : false;
  const abilityOptions = castingAbilities.map((ability) => {
    const modifier = abilityModifiers[ability];
    return {
      id: ability,
      name: abilityNames[ability],
      description: `Save DC ${8 + proficiencyBonus + modifier} · ${signed(
        proficiencyBonus + modifier,
      )} to hit`,
    };
  });

  const ready = selectedId !== null && (!needsAbility || castingAbility !== null);

  function confirm() {
    if (!selectedId) return;
    onChoose(selectedId, needsAbility ? (castingAbility ?? undefined) : undefined);
  }

  return (
    <ChoiceDialog
      title={`${speciesName} Lineage`}
      subtitle="Choose a lineage."
      confirmDisabled={!ready}
      onConfirm={confirm}
      onCancel={onCancel}
    >
      <OptionList options={listOptions} selectedId={selectedId} onSelect={select} />

      {needsAbility ? (
        <div>
          <p className={styles.abilityLabel}>Choose its spellcasting ability.</p>
          <OptionList
            options={abilityOptions}
            selectedId={castingAbility}
            onSelect={(id) => setCastingAbility(id as Ability)}
          />
        </div>
      ) : null}
    </ChoiceDialog>
  );
}
