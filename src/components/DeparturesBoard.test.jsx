import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import DeparturesBoard from './DeparturesBoard.jsx';

const flights = [
  { id: 'T1', flight: 'T1', destination: 'Testville', gate: 'A1', departureTime: '10:00', status: 'On time' },
  { id: 'T2', flight: 'T2', destination: 'Mockford', gate: 'B2', departureTime: '11:00', status: 'Delayed' },
];

describe('DeparturesBoard', () => {
  it('shows one row per flight', () => {
    render(<DeparturesBoard flights={flights} />);

    expect(screen.getByText('Testville')).toBeInTheDocument();
    expect(screen.getByText('Mockford')).toBeInTheDocument();
    // 1 header row + 2 flight rows
    expect(screen.getAllByRole('row')).toHaveLength(3);
  });

  it('shows a friendly message when there are no flights', () => {
    render(<DeparturesBoard flights={[]} />);

    expect(screen.getByText('No departures scheduled.')).toBeInTheDocument();
  });
});
