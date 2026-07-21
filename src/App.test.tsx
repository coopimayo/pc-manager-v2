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
    const actions = screen.getByRole('heading', { name: 'Actions' }).closest('section') as HTMLElement;
    expect(within(actions).getByText('Action Surge')).toBeInTheDocument();
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
    const featsSection = screen
      .getByRole('heading', { name: 'Feats' })
      .closest('section') as HTMLElement;
    expect(within(featsSection).queryByText('Ability Score Improvement')).not.toBeInTheDocument();

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
    const actionsSection = screen
      .getByRole('heading', { name: 'Actions' })
      .closest('section') as HTMLElement;
    expect(within(actionsSection).getByText('Second Wind')).toBeInTheDocument();
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

  it('requires and applies skill picks when the background feat is Skilled', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'New Character' }));
    await user.type(screen.getByLabelText('Name'), 'Selene Highmore');
    await user.click(screen.getByRole('button', { name: /Human/ }));
    await user.click(screen.getByRole('button', { name: /Noble/ }));
    await user.click(screen.getByRole('button', { name: 'Increase STR' }));
    await user.click(screen.getByRole('button', { name: 'Increase STR' }));
    await user.click(screen.getByRole('button', { name: 'Increase INT' }));
    await user.click(screen.getByRole('button', { name: /Fighter/ }));

    await user.selectOptions(screen.getByLabelText('STR'), '15');
    await user.selectOptions(screen.getByLabelText('DEX'), '13');
    await user.selectOptions(screen.getByLabelText('CON'), '14');
    await user.selectOptions(screen.getByLabelText('INT'), '10');
    await user.selectOptions(screen.getByLabelText('WIS'), '12');
    await user.selectOptions(screen.getByLabelText('CHA'), '8');

    const skillsSection = screen
      .getByRole('heading', { name: 'Skills' })
      .closest('section') as HTMLElement;
    await user.click(within(skillsSection).getByRole('button', { name: 'Acrobatics' }));
    await user.click(within(skillsSection).getByRole('button', { name: 'Perception' }));
    await user.click(screen.getByRole('button', { name: /Option A/ }));
    await user.click(screen.getByRole('button', { name: /Archery/ }));

    const create = () => screen.getByRole('button', { name: 'Create Character' });
    expect(create()).toBeDisabled();

    const backgroundSection = screen
      .getByRole('heading', { name: 'Background' })
      .closest('section') as HTMLElement;
    expect(within(backgroundSection).getByRole('button', { name: 'History' })).toBeDisabled();
    expect(within(backgroundSection).getByRole('button', { name: 'Acrobatics' })).toBeDisabled();

    await user.click(within(backgroundSection).getByRole('button', { name: 'Arcana' }));
    await user.click(within(backgroundSection).getByRole('button', { name: 'Stealth' }));
    await user.click(within(backgroundSection).getByRole('button', { name: 'Insight' }));
    expect(create()).toBeEnabled();

    await user.click(create());

    expect(screen.getByRole('heading', { name: 'Selene Highmore' })).toBeInTheDocument();
    expect(screen.getByText('Skilled')).toBeInTheDocument();

    const sheetSkills = screen
      .getByRole('heading', { name: 'Skills' })
      .closest('section') as HTMLElement;
    const arcana = within(sheetSkills).getByText('Arcana').closest('li') as HTMLElement;
    expect(arcana).toHaveTextContent('+2');
  });

  it('hides a feature on request and restores it from the hidden list', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /Vera Quickblade/ }));
    const features = screen
      .getByRole('heading', { name: 'Features' })
      .closest('section') as HTMLElement;

    await user.click(within(features).getByRole('button', { name: 'Hide Second Wind' }));
    expect(within(features).queryByText('Second Wind')).not.toBeInTheDocument();

    await user.click(within(features).getByRole('button', { name: 'Show 1 hidden' }));
    expect(within(features).getByText('Second Wind')).toBeInTheDocument();

    await user.click(within(features).getByRole('button', { name: 'Show Second Wind' }));
    expect(within(features).queryByRole('button', { name: /hidden/ })).not.toBeInTheDocument();
    expect(within(features).getByText('Second Wind')).toBeInTheDocument();
  });

  it('hides a species trait behind the hidden toggle', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /Bram Stonefist/ }));
    const traits = screen
      .getByRole('heading', { name: 'Traits' })
      .closest('section') as HTMLElement;

    await user.click(within(traits).getByRole('button', { name: 'Hide Skillful' }));
    expect(within(traits).queryByText('Skillful')).not.toBeInTheDocument();
    expect(within(traits).getByText('Resourceful')).toBeInTheDocument();

    await user.click(within(traits).getByRole('button', { name: 'Show 1 hidden' }));
    await user.click(within(traits).getByRole('button', { name: 'Show Skillful' }));
    expect(within(traits).getByText('Skillful')).toBeInTheDocument();
  });

  it('keeps an edit after the app is reloaded', async () => {
    const user = userEvent.setup();
    const first = render(<App />);

    await user.click(screen.getByRole('button', { name: /Vera Quickblade/ }));
    const features = screen
      .getByRole('heading', { name: 'Features' })
      .closest('section') as HTMLElement;
    await user.click(within(features).getByRole('button', { name: 'Hide Second Wind' }));
    expect(within(features).queryByText('Second Wind')).not.toBeInTheDocument();

    first.unmount();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /Vera Quickblade/ }));
    const reloaded = screen
      .getByRole('heading', { name: 'Features' })
      .closest('section') as HTMLElement;
    expect(within(reloaded).queryByText('Second Wind')).not.toBeInTheDocument();
    expect(within(reloaded).getByRole('button', { name: 'Show 1 hidden' })).toBeInTheDocument();
  });

  it('returns to the dashboard when creation is cancelled', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'New Character' }));
    await user.click(screen.getByRole('button', { name: /All characters/ }));

    expect(screen.getByRole('heading', { name: 'Characters' })).toBeInTheDocument();
    expect(screen.getByText('2 characters')).toBeInTheDocument();
  });

  it('deletes a character from its sheet after confirming', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /Vera Quickblade/ }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('heading', { name: 'Vera Quickblade' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(screen.getByRole('heading', { name: 'Characters' })).toBeInTheDocument();
    expect(screen.getByText('1 character')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Vera Quickblade/ })).not.toBeInTheDocument();
  });

  it('keeps a deletion after the app is reloaded', async () => {
    const user = userEvent.setup();
    const first = render(<App />);

    await user.click(screen.getByRole('button', { name: /Vera Quickblade/ }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    first.unmount();
    render(<App />);

    expect(screen.queryByRole('button', { name: /Vera Quickblade/ })).not.toBeInTheDocument();
  });

  it('returns to the dashboard from a sheet', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /Bram Stonefist/ }));
    await user.click(screen.getByRole('button', { name: /All characters/ }));

    expect(screen.getByRole('heading', { name: 'Characters' })).toBeInTheDocument();
  });
});
