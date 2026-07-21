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
    const next = () => screen.getByRole('button', { name: /Next/ });

    // Species
    await user.click(screen.getByRole('button', { name: /Human/ }));
    await user.click(screen.getByRole('button', { name: 'Stealth' }));
    await user.click(next());

    // Background
    await user.click(screen.getByRole('button', { name: /Soldier/ }));
    await user.click(screen.getByRole('button', { name: 'Increase STR' }));
    await user.click(screen.getByRole('button', { name: 'Increase STR' }));
    await user.click(screen.getByRole('button', { name: 'Increase CON' }));
    await user.click(next());

    // Class
    await user.click(screen.getByRole('button', { name: /Fighter/ }));
    const skillsSection = screen
      .getByRole('heading', { name: 'Skills' })
      .closest('section') as HTMLElement;
    await user.click(within(skillsSection).getByRole('button', { name: 'Acrobatics' }));
    await user.click(within(skillsSection).getByRole('button', { name: 'Perception' }));
    await user.click(screen.getByRole('button', { name: /Option A/ }));
    await user.click(screen.getByRole('button', { name: /Archery/ }));
    await user.click(next());

    // Basics
    await user.type(screen.getByLabelText('Name'), 'Torin Oakenshield');
    await user.selectOptions(screen.getByLabelText('STR'), '15');
    await user.selectOptions(screen.getByLabelText('DEX'), '13');
    await user.selectOptions(screen.getByLabelText('CON'), '14');
    await user.selectOptions(screen.getByLabelText('INT'), '10');
    await user.selectOptions(screen.getByLabelText('WIS'), '12');
    await user.selectOptions(screen.getByLabelText('CHA'), '8');
    await user.click(next());

    // Review
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

    const sheetSkills = screen
      .getByRole('heading', { name: 'Skills' })
      .closest('section') as HTMLElement;
    const stealth = within(sheetSkills).getByText('Stealth').closest('li') as HTMLElement;
    expect(stealth).toHaveTextContent('+3');

    await user.click(screen.getByRole('button', { name: /All characters/ }));
    const card = screen.getByRole('button', { name: /Torin Oakenshield/ });
    expect(card).toHaveTextContent('Fighter 1');
    expect(card).toHaveTextContent('12 HP');
  });

  it('forces an Elf lineage choice during creation and grants its spell', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'New Character' }));
    const next = () => screen.getByRole('button', { name: /Next/ });

    // Species — Elf needs a Keen Senses skill, a lineage, and (for High Elf) a
    // spellcasting ability before the step is complete.
    await user.click(screen.getByRole('button', { name: /Elf/ }));
    await user.click(screen.getByRole('button', { name: 'Perception' }));
    expect(next()).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /High Elf/ }));
    expect(next()).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /Intelligence/ }));
    expect(next()).toBeEnabled();
    await user.click(next());

    // Background
    await user.click(screen.getByRole('button', { name: /Soldier/ }));
    await user.click(screen.getByRole('button', { name: 'Increase STR' }));
    await user.click(screen.getByRole('button', { name: 'Increase STR' }));
    await user.click(screen.getByRole('button', { name: 'Increase CON' }));
    await user.click(next());

    // Class
    await user.click(screen.getByRole('button', { name: /Fighter/ }));
    const skillsSection = screen
      .getByRole('heading', { name: 'Skills' })
      .closest('section') as HTMLElement;
    await user.click(within(skillsSection).getByRole('button', { name: 'Acrobatics' }));
    await user.click(within(skillsSection).getByRole('button', { name: 'History' }));
    await user.click(screen.getByRole('button', { name: /Option A/ }));
    await user.click(screen.getByRole('button', { name: /Archery/ }));
    await user.click(next());

    // Basics
    await user.type(screen.getByLabelText('Name'), 'Aelar');
    await user.selectOptions(screen.getByLabelText('STR'), '15');
    await user.selectOptions(screen.getByLabelText('DEX'), '14');
    await user.selectOptions(screen.getByLabelText('CON'), '13');
    await user.selectOptions(screen.getByLabelText('INT'), '12');
    await user.selectOptions(screen.getByLabelText('WIS'), '10');
    await user.selectOptions(screen.getByLabelText('CHA'), '8');
    await user.click(next());

    // Review, then create.
    await user.click(screen.getByRole('button', { name: 'Create Character' }));

    // The sheet opens with the lineage already set — no after-the-fact prompt.
    expect(screen.getByText(/Elf \(High Elf\)/)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Choose your Elf lineage/ }),
    ).not.toBeInTheDocument();

    // The High Elf cantrip is known, cast off the chosen Intelligence ability.
    await user.click(screen.getByRole('button', { name: /Open spellbook/ }));
    expect(screen.getByText('Prestidigitation')).toBeInTheDocument();
    expect(screen.getByText('INT')).toBeInTheDocument();
  });

  it('gates each step until its choices are made', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'New Character' }));
    const next = () => screen.getByRole('button', { name: /Next/ });

    // Species — Human's Skillful trait needs a skill before advancing
    expect(next()).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /Human/ }));
    expect(next()).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Stealth' }));
    expect(next()).toBeEnabled();
    await user.click(next());

    // Background — the +2/+1 allocation must be spent
    expect(next()).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /Soldier/ }));
    expect(next()).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Increase STR' }));
    await user.click(screen.getByRole('button', { name: 'Increase DEX' }));
    await user.click(screen.getByRole('button', { name: 'Increase CON' }));
    expect(next()).toBeEnabled();
    await user.click(next());

    // Class — skills, equipment and the fighting style are all required
    expect(next()).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /Fighter/ }));
    expect(next()).toBeDisabled();
    const skillsSection = screen
      .getByRole('heading', { name: 'Skills' })
      .closest('section') as HTMLElement;
    await user.click(within(skillsSection).getByRole('button', { name: 'Acrobatics' }));
    await user.click(within(skillsSection).getByRole('button', { name: 'Perception' }));
    expect(within(skillsSection).getByRole('button', { name: 'Athletics' })).toBeDisabled();
    expect(within(skillsSection).getByRole('button', { name: 'History' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /Option A/ }));
    expect(next()).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /Archery/ }));
    expect(next()).toBeEnabled();
    await user.click(next());

    // Basics
    expect(next()).toBeDisabled();
    await user.type(screen.getByLabelText('Name'), 'Torin');
    await user.selectOptions(screen.getByLabelText('STR'), '15');
    await user.selectOptions(screen.getByLabelText('DEX'), '13');
    await user.selectOptions(screen.getByLabelText('CON'), '14');
    await user.selectOptions(screen.getByLabelText('INT'), '10');
    await user.selectOptions(screen.getByLabelText('WIS'), '12');
    await user.selectOptions(screen.getByLabelText('CHA'), '8');
    expect(next()).toBeEnabled();
    await user.click(next());

    // Review
    expect(screen.getByRole('button', { name: 'Create Character' })).toBeEnabled();
  });

  it('requires and applies skill picks when the background feat is Skilled', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'New Character' }));
    const next = () => screen.getByRole('button', { name: /Next/ });

    // Species
    await user.click(screen.getByRole('button', { name: /Human/ }));
    await user.click(screen.getByRole('button', { name: 'Nature' }));
    await user.click(next());

    // Background — Noble's Skilled feat requires three skill picks
    await user.click(screen.getByRole('button', { name: /Noble/ }));
    await user.click(screen.getByRole('button', { name: 'Increase STR' }));
    await user.click(screen.getByRole('button', { name: 'Increase STR' }));
    await user.click(screen.getByRole('button', { name: 'Increase INT' }));
    const backgroundSection = screen
      .getByRole('heading', { name: 'Background' })
      .closest('section') as HTMLElement;
    expect(within(backgroundSection).getByRole('button', { name: 'History' })).toBeDisabled();
    expect(next()).toBeDisabled();
    await user.click(within(backgroundSection).getByRole('button', { name: 'Arcana' }));
    await user.click(within(backgroundSection).getByRole('button', { name: 'Stealth' }));
    await user.click(within(backgroundSection).getByRole('button', { name: 'Insight' }));
    expect(next()).toBeEnabled();
    await user.click(next());

    // Class — the Insight taken by Skilled is locked out of the class list
    await user.click(screen.getByRole('button', { name: /Fighter/ }));
    const skillsSection = screen
      .getByRole('heading', { name: 'Skills' })
      .closest('section') as HTMLElement;
    expect(within(skillsSection).getByRole('button', { name: 'Insight' })).toBeDisabled();
    await user.click(within(skillsSection).getByRole('button', { name: 'Acrobatics' }));
    await user.click(within(skillsSection).getByRole('button', { name: 'Perception' }));
    await user.click(screen.getByRole('button', { name: /Option A/ }));
    await user.click(screen.getByRole('button', { name: /Archery/ }));
    await user.click(next());

    // Basics
    await user.type(screen.getByLabelText('Name'), 'Selene Highmore');
    await user.selectOptions(screen.getByLabelText('STR'), '15');
    await user.selectOptions(screen.getByLabelText('DEX'), '13');
    await user.selectOptions(screen.getByLabelText('CON'), '14');
    await user.selectOptions(screen.getByLabelText('INT'), '10');
    await user.selectOptions(screen.getByLabelText('WIS'), '12');
    await user.selectOptions(screen.getByLabelText('CHA'), '8');
    await user.click(next());

    // Review
    const create = () => screen.getByRole('button', { name: 'Create Character' });
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

  it('grants an Elf lineage its level-gated spells and chosen casting ability', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Vera is a level-3 Elf who has not chosen a lineage yet.
    await user.click(screen.getByRole('button', { name: /Vera Quickblade/ }));
    await user.click(screen.getByRole('button', { name: /Choose your Elf lineage/ }));

    await user.click(screen.getByRole('button', { name: /Wood Elf/ }));
    await user.click(screen.getByRole('button', { name: /Wisdom/ }));
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    await user.click(screen.getByRole('button', { name: /Open spellbook/ }));

    // Druidcraft (cantrip) and Longstrider (unlocked at level 3) are known; the
    // level-5 spell is not yet.
    expect(screen.getByText('Druidcraft')).toBeInTheDocument();
    expect(screen.getByText('Longstrider')).toBeInTheDocument();
    expect(screen.queryByText('Pass without Trace')).not.toBeInTheDocument();
    // The chosen casting ability drives the header (WIS 13 → +1, proficiency +2).
    expect(screen.getByText('WIS')).toBeInTheDocument();
    expect(screen.getByText('11')).toBeInTheDocument();
  });
});
