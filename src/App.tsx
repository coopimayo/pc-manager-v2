import { useState } from 'react';

import { characters } from './data/characters';
import { CharacterSheet } from './pages/CharacterSheet';
import { Dashboard } from './pages/Dashboard';

export function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = characters.find((character) => character.id === selectedId);

  if (selected) {
    return <CharacterSheet character={selected} onBack={() => setSelectedId(null)} />;
  }

  return <Dashboard characters={characters} onSelect={setSelectedId} />;
}
