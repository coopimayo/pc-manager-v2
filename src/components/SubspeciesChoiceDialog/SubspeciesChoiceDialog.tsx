import { useState } from 'react';

import type { Subspecies } from '../../types/species';
import { ChoiceDialog } from '../ChoiceDialog';
import { OptionList } from '../OptionList';

interface SubspeciesChoiceDialogProps {
  speciesName: string;
  options: Subspecies[];
  onChoose: (subspeciesId: string) => void;
  onCancel: () => void;
}

export function SubspeciesChoiceDialog({
  speciesName,
  options,
  onChoose,
  onCancel,
}: SubspeciesChoiceDialogProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const listOptions = options.map((option) => ({
    id: option.id,
    name: option.name,
    description: option.traits.map((trait) => trait.name).join(' · '),
  }));

  return (
    <ChoiceDialog
      title={`${speciesName} Lineage`}
      subtitle="Choose a lineage."
      confirmDisabled={selectedId === null}
      onConfirm={() => selectedId && onChoose(selectedId)}
      onCancel={onCancel}
    >
      <OptionList options={listOptions} selectedId={selectedId} onSelect={setSelectedId} />
    </ChoiceDialog>
  );
}
