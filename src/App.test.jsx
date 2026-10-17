import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App.jsx';

describe('App', () => {
  it('shows the departures board once flights arrive', async () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'SkyWatch' })).toBeInTheDocument();
    expect(await screen.findByText('Reykjavik', {}, { timeout: 3000 })).toBeInTheDocument();
  });
});
