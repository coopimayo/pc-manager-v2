import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from './App.tsx';

describe('App', () => {
  it('renders the character name and class', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Bram Stonefist' })).toBeInTheDocument();
    expect(screen.getByText('Fighter 1')).toBeInTheDocument();
  });

  it('renders derived abilities with their activation cost', () => {
    render(<App />);
    expect(screen.getAllByText('Second Wind').length).toBeGreaterThan(0);
    expect(screen.getByText('Bonus Action')).toBeInTheDocument();
    expect(screen.getByText(/regains 1 on a short rest, all on a long rest/)).toBeInTheDocument();
  });

  it('renders every skill', () => {
    render(<App />);
    expect(screen.getByText('Athletics')).toBeInTheDocument();
    expect(screen.getByText('Animal Handling')).toBeInTheDocument();
    expect(screen.getByText('Sleight Of Hand')).toBeInTheDocument();
  });
});
