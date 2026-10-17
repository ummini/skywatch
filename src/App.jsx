import { useEffect, useState } from 'react';
import { getDepartures } from './api/getDepartures.js';
import DeparturesBoard from './components/DeparturesBoard.jsx';

export default function App() {
  const [flights, setFlights] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getDepartures().then((data) => {
      if (!cancelled) setFlights(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="app">
      <header className="app__header">
        <h1>SkyWatch</h1>
        <p className="app__tagline">Live departures from Hack the Skies International</p>
      </header>
      {/* TODO: nothing is shown while flights are loading, and errors are ignored. */}
      {flights && <DeparturesBoard flights={flights} />}
    </main>
  );
}
