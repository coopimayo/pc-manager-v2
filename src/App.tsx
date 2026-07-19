import { useState } from 'react';

import { characters as initialCharacters } from './data/characters';
import { CharacterCreator } from './pages/CharacterCreator';
import { CharacterSheet } from './pages/CharacterSheet';
import { Dashboard } from './pages/Dashboard';

export function App() {
  const [characters, setCharacters] = useState(initialCharacters);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  if (creating) {
    return (
      <CharacterCreator
        takenIds={characters.map((character) => character.id)}
        onCreate={(character) => {
          setCharacters((current) => [...current, character]);
          setCreating(false);
          setSelectedId(character.id);
        }}
        onCancel={() => setCreating(false)}
      />
    );
  }

  const selected = characters.find((character) => character.id === selectedId);

  if (selected) {
    return <CharacterSheet character={selected} onBack={() => setSelectedId(null)} />;
  }

  return (
    <Dashboard
      characters={characters}
      onSelect={setSelectedId}
      onCreate={() => setCreating(true)}
    />
  );
}
