import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { savageAttacker, skilled } from '../../data/feats/origin';
import type { Ability, Skill } from '../../types';
import { FeatChoiceDialog } from './FeatChoiceDialog';

const abilityScores: Record<Ability, number> = {
  str: 15,
  dex: 13,
  con: 14,
  int: 10,
  wis: 12,
  cha: 8,
};

function renderDialog(onChoose = vi.fn()) {
  render(
    <FeatChoiceDialog
      featureName="Versatile"
      options={[savageAttacker, skilled]}
      abilityScores={abilityScores}
      proficientSkills={['athletics', 'intimidation'] as Skill[]}
      onChoose={onChoose}
      onCancel={vi.fn()}
    />,
  );
  return onChoose;
}

describe('FeatChoiceDialog', () => {
  it('gates the Skilled feat on choosing exactly three skills', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole('button', { name: /Skilled/ }));
    expect(screen.getByText('Choose 3 skills — 0 of 3 chosen.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Acrobatics' }));
    await user.click(screen.getByRole('button', { name: 'Arcana' }));
    await user.click(screen.getByRole('button', { name: 'Stealth' }));

    expect(screen.getByText('Choose 3 skills — 3 of 3 chosen.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'History' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Arcana' }));
    expect(screen.getByText('Choose 3 skills — 2 of 3 chosen.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'History' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled();
  });

  it('disables skills the character is already proficient in', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole('button', { name: /Skilled/ }));

    expect(screen.getByRole('button', { name: 'Athletics' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Intimidation' })).toBeDisabled();
  });

  it('reports the chosen skills alongside the feat', async () => {
    const user = userEvent.setup();
    const onChoose = renderDialog();

    await user.click(screen.getByRole('button', { name: /Skilled/ }));
    await user.click(screen.getByRole('button', { name: 'Acrobatics' }));
    await user.click(screen.getByRole('button', { name: 'Arcana' }));
    await user.click(screen.getByRole('button', { name: 'Stealth' }));
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(onChoose).toHaveBeenCalledWith('skilled', undefined, [
      'acrobatics',
      'arcana',
      'stealth',
    ]);
  });

  it('drops the skill picks when another feat is selected instead', async () => {
    const user = userEvent.setup();
    const onChoose = renderDialog();

    await user.click(screen.getByRole('button', { name: /Skilled/ }));
    await user.click(screen.getByRole('button', { name: 'Acrobatics' }));
    await user.click(screen.getByRole('button', { name: /Savage Attacker/ }));

    expect(screen.queryByText(/of 3 chosen/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onChoose).toHaveBeenCalledWith('savage-attacker', undefined, undefined);
  });
});
