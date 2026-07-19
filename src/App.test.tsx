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

    expect(screen.getByText('Choose a subclass.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Champion/ }));
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    await user.click(levelUp());

    expect(screen.getByText('Choose a feat to gain.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Ability Score Improvement/ }));
    await user.click(screen.getByRole('button', { name: 'Increase STR' }));
    await user.click(screen.getByRole('button', { name: 'Increase STR' }));
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(screen.queryByText('Choose a feat to gain.')).not.toBeInTheDocument();
    expect(screen.getByText(/Fighter 4/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Feats' })).toBeInTheDocument();
    expect(screen.queryByText('Ability Score Improvement')).not.toBeInTheDocument();

    const abilityScores = screen
      .getByRole('heading', { name: 'Ability Scores' })
      .closest('section') as HTMLElement;
    expect(within(abilityScores).getByText('18')).toBeInTheDocument();
    expect(within(abilityScores).getByText('+4')).toBeInTheDocument();
  });

  it('prompts for a subclass at level 3 and folds in its features', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /Bram Stonefist/ }));
    const levelUp = () => screen.getByRole('button', { name: 'Level Up' });
    await user.click(levelUp());
    await user.click(levelUp());

    expect(screen.getByText('Choose a subclass.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Champion/ }));
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(screen.queryByText('Choose a subclass.')).not.toBeInTheDocument();
    expect(screen.getByText(/Fighter 3/)).toBeInTheDocument();
    expect(screen.getByText('Improved Critical')).toBeInTheDocument();
    expect(screen.getByText('Remarkable Athlete')).toBeInTheDocument();
  });

  it('aborts the level-up when the feat choice is cancelled', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /Bram Stonefist/ }));
    const levelUp = () => screen.getByRole('button', { name: 'Level Up' });
    await user.click(levelUp());
    await user.click(levelUp());
    await user.click(screen.getByRole('button', { name: /Champion/ }));
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    await user.click(levelUp());

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByText('Choose a feat to gain.')).not.toBeInTheDocument();
    expect(screen.getByText(/Fighter 3/)).toBeInTheDocument();
  });

  it('creates a new character and opens its sheet', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'New Character' }));
    expect(screen.getByRole('heading', { name: 'New Character' })).toBeInTheDocument();

    await user.type(screen.getByLabelText('Name'), 'Torin Oakenshield');
    await user.click(screen.getByRole('button', { name: /Human/ }));
    await user.click(screen.getByRole('button', { name: /Soldier/ }));
    await user.click(screen.getByRole('button', { name: 'Increase STR' }));
    await user.click(screen.getByRole('button', { name: 'Increase STR' }));
    await user.click(screen.getByRole('button', { name: 'Increase CON' }));
    await user.click(screen.getByRole('button', { name: /Fighter/ }));

    await user.selectOptions(screen.getByLabelText('STR'), '15');
    await user.selectOptions(screen.getByLabelText('DEX'), '13');
    await user.selectOptions(screen.getByLabelText('CON'), '14');
    await user.selectOptions(screen.getByLabelText('INT'), '10');
    await user.selectOptions(screen.getByLabelText('WIS'), '12');
    await user.selectOptions(screen.getByLabelText('CHA'), '8');

    await user.click(screen.getByRole('button', { name: 'Acrobatics' }));
    await user.click(screen.getByRole('button', { name: 'Perception' }));
    await user.click(screen.getByRole('button', { name: /Option A/ }));
    await user.click(screen.getByRole('button', { name: /Archery/ }));

    await user.click(screen.getByRole('button', { name: 'Create Character' }));

    expect(screen.getByRole('heading', { name: 'Torin Oakenshield' })).toBeInTheDocument();
    expect(screen.getByText('Human · Soldier · Fighter 1')).toBeInTheDocument();
    expect(screen.getByText('Greatsword')).toBeInTheDocument();
    expect(screen.getByText('2d6 + 3 slashing')).toBeInTheDocument();
    expect(screen.getByText('Second Wind')).toBeInTheDocument();
    expect(screen.getByText('Archery')).toBeInTheDocument();
    expect(screen.getByText('Savage Attacker')).toBeInTheDocument();
    expect(screen.getByText('Resourceful')).toBeInTheDocument();

    const abilityScores = screen
      .getByRole('heading', { name: 'Ability Scores' })
      .closest('section') as HTMLElement;
    expect(within(abilityScores).getByText('17')).toBeInTheDocument();
    expect(within(abilityScores).getByText('15')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /All characters/ }));
    const card = screen.getByRole('button', { name: /Torin Oakenshield/ });
    expect(card).toHaveTextContent('Fighter 1');
    expect(card).toHaveTextContent('12 HP');
  });

  it('disables Create Character until every choice is made', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'New Character' }));
    const create = () => screen.getByRole('button', { name: 'Create Character' });
    expect(create()).toBeDisabled();

    await user.type(screen.getByLabelText('Name'), 'Torin');
    await user.click(screen.getByRole('button', { name: /Human/ }));
    await user.click(screen.getByRole('button', { name: /Soldier/ }));
    await user.click(screen.getByRole('button', { name: /Fighter/ }));

    await user.selectOptions(screen.getByLabelText('STR'), '15');
    await user.selectOptions(screen.getByLabelText('DEX'), '13');
    await user.selectOptions(screen.getByLabelText('CON'), '14');
    await user.selectOptions(screen.getByLabelText('INT'), '10');
    await user.selectOptions(screen.getByLabelText('WIS'), '12');
    await user.selectOptions(screen.getByLabelText('CHA'), '8');

    await user.click(screen.getByRole('button', { name: 'Acrobatics' }));
    await user.click(screen.getByRole('button', { name: 'Perception' }));
    expect(screen.getByRole('button', { name: 'Athletics' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'History' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: /Option A/ }));
    await user.click(screen.getByRole('button', { name: /Archery/ }));
    expect(create()).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Increase STR' }));
    await user.click(screen.getByRole('button', { name: 'Increase DEX' }));
    await user.click(screen.getByRole('button', { name: 'Increase CON' }));
    expect(create()).toBeEnabled();
  });

  it('returns to the dashboard when creation is cancelled', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'New Character' }));
    await user.click(screen.getByRole('button', { name: /All characters/ }));

    expect(screen.getByRole('heading', { name: 'Characters' })).toBeInTheDocument();
    expect(screen.getByText('2 characters')).toBeInTheDocument();
  });

  it('returns to the dashboard from a sheet', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /Bram Stonefist/ }));
    await user.click(screen.getByRole('button', { name: /All characters/ }));

    expect(screen.getByRole('heading', { name: 'Characters' })).toBeInTheDocument();
  });
});
