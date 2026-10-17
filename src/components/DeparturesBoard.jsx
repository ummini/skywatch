const STATUS_CLASS = {
  'On time': 'status--ontime',
  Boarding: 'status--boarding',
  Delayed: 'status--delayed',
  Cancelled: 'status--cancelled',
};

export default function DeparturesBoard({ flights }) {
  if (flights.length === 0) {
    return <p className="board__empty">No departures scheduled.</p>;
  }

  return (
    <table className="board">
      <caption>Departures</caption>
      <thead>
        <tr>
          <th scope="col">Time</th>
          <th scope="col">Flight</th>
          <th scope="col">Destination</th>
          <th scope="col">Gate</th>
          <th scope="col">Status</th>
        </tr>
      </thead>
      <tbody>
        {flights.map((flight) => (
          <tr key={flight.id}>
            <td>{flight.departureTime}</td>
            <td>{flight.flight}</td>
            <td>{flight.destination}</td>
            <td>{flight.gate}</td>
            <td className={STATUS_CLASS[flight.status] ?? ''}>{flight.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
