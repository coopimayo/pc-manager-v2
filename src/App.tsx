import { useState } from 'react';

import { usePersistentCharacters } from './hooks/usePersistentCharacters';
import { CharacterCreator } from './pages/CharacterCreator';
import { CharacterSheet } from './pages/CharacterSheet';
import { Dashboard } from './pages/Dashboard';

export function App() {
  const [characters, setCharacters] = usePersistentCharacters();
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
    return (
      <CharacterSheet
        character={selected}
        onChange={(updated) =>
          setCharacters((current) =>
            current.map((character) => (character.id === updated.id ? updated : character)),
          )
        }
        onBack={() => setSelectedId(null)}
      />
    );
  }

  return (
    <Dashboard
      characters={characters}
      onSelect={setSelectedId}
      onCreate={() => setCreating(true)}
    />
  );
}
