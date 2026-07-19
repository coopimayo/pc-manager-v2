import { useState } from 'react';

import type { Subclass } from '../../types/class';
import { ChoiceDialog } from '../ChoiceDialog';
import { OptionList } from '../OptionList';

interface SubclassChoiceDialogProps {
  featureName: string;
  options: Subclass[];
  onChoose: (subclassId: string) => void;
  onCancel: () => void;
}

export function SubclassChoiceDialog({
  featureName,
  options,
  onChoose,
  onCancel,
}: SubclassChoiceDialogProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <ChoiceDialog
      title={featureName}
      subtitle="Choose a subclass."
      confirmDisabled={selectedId === null}
      onConfirm={() => selectedId && onChoose(selectedId)}
      onCancel={onCancel}
    >
      <OptionList options={options} selectedId={selectedId} onSelect={setSelectedId} />
    </ChoiceDialog>
  );
}
