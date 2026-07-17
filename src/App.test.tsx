import { render, screen } from '@testing-library/react';
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
    expect(screen.getAllByText('Action Surge')).toHaveLength(2);
    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Characters' })).not.toBeInTheDocument();
  });

  it('returns to the dashboard from a sheet', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /Bram Stonefist/ }));
    await user.click(screen.getByRole('button', { name: /All characters/ }));

    expect(screen.getByRole('heading', { name: 'Characters' })).toBeInTheDocument();
  });
});
