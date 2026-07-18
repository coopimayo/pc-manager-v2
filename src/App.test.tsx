import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { App } from './App.tsx';

describe('App', () => {
  it('opens on the dashboard listing every character', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Characters' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Bram Stonefist/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Vera Quickblade/ })).toBeInTheDocument();
  });

  it('shows derived summaries on the dashboard cards', () => {
    render(<App />);
    const vera = screen.getByRole('button', { name: /Vera Quickblade/ });
    expect(vera).toHaveTextContent('Fighter 3');
    expect(vera).toHaveTextContent('28 HP');
    expect(vera).toHaveTextContent('2 abilities');
    expect(screen.getByRole('button', { name: /Bram Stonefist/ })).toHaveTextContent('1 ability');
  });

  it('opens a character sheet when a card is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /Vera Quickblade/ }));

    expect(screen.getByRole('heading', { name: 'Vera Quickblade' })).toBeInTheDocument();
    expect(screen.getByText('Action Surge')).toBeInTheDocument();
    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText('Longbow')).toBeInTheDocument();
    expect(screen.getByText('1d8 + 3 piercing')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Characters' })).not.toBeInTheDocument();
  });

  it('tracks uses of an ability', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /Vera Quickblade/ }));
    expect(screen.getByText('2 of 2 left')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Second Wind use 2 of 2' }));
    expect(screen.getByText('1 of 2 left')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Second Wind use 1 of 2' }));
    expect(screen.getByText('0 of 2 left')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Second Wind use 2 of 2' }));
    expect(screen.getByText('2 of 2 left')).toBeInTheDocument();
  });

  it('prompts for a feat when leveling into an Ability Score Improvement', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /Bram Stonefist/ }));
    const levelUp = () => screen.getByRole('button', { name: 'Level Up' });
    await user.click(levelUp());
    await user.click(levelUp());
    await user.click(levelUp());

    expect(screen.getByText('Choose a feat to gain.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Ability Score Improvement/ }));
    await user.click(screen.getByRole('button', { name: 'Increase STR' }));
    await user.click(screen.getByRole('button', { name: 'Increase STR' }));
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(screen.queryByText('Choose a feat to gain.')).not.toBeInTheDocument();
    expect(screen.getByText('Fighter 4')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Feats' })).toBeInTheDocument();
    expect(screen.getByText('Ability Score Improvement')).toBeInTheDocument();

    const abilityScores = screen
      .getByRole('heading', { name: 'Ability Scores' })
      .closest('section') as HTMLElement;
    expect(within(abilityScores).getByText('18')).toBeInTheDocument();
    expect(within(abilityScores).getByText('+4')).toBeInTheDocument();
  });

  it('aborts the level-up when the feat choice is cancelled', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /Bram Stonefist/ }));
    const levelUp = () => screen.getByRole('button', { name: 'Level Up' });
    await user.click(levelUp());
    await user.click(levelUp());
    await user.click(levelUp());

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByText('Choose a feat to gain.')).not.toBeInTheDocument();
    expect(screen.getByText('Fighter 3')).toBeInTheDocument();
  });

  it('returns to the dashboard from a sheet', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /Bram Stonefist/ }));
    await user.click(screen.getByRole('button', { name: /All characters/ }));

    expect(screen.getByRole('heading', { name: 'Characters' })).toBeInTheDocument();
  });
});
