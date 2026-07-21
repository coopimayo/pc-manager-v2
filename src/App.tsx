import { useState } from 'react';

import { usePersistentCharacters } from './hooks/usePersistentCharacters';
import { CharacterCreator } from './pages/CharacterCreator';
import { CharacterSheet } from './pages/CharacterSheet';
import { CharacterSpells } from './pages/CharacterSpells';
import { Dashboard } from './pages/Dashboard';

export function App() {
  const [characters, setCharacters] = usePersistentCharacters();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [characterView, setCharacterView] = useState<'sheet' | 'spells'>('sheet');

  function selectCharacter(id: string | null) {
    setSelectedId(id);
    setCharacterView('sheet');
  }

  if (creating) {
    return (
      <CharacterCreator
        takenIds={characters.map((character) => character.id)}
        onCreate={(character) => {
          setCharacters((current) => [...current, character]);
          setCreating(false);
          selectCharacter(character.id);
        }}
        onCancel={() => setCreating(false)}
      />
    );
  }

  const selected = characters.find((character) => character.id === selectedId);

  if (selected) {
    if (characterView === 'spells') {
      return (
        <CharacterSpells character={selected} onBack={() => setCharacterView('sheet')} />
      );
    }

    return (
      <CharacterSheet
        character={selected}
        onChange={(updated) =>
          setCharacters((current) =>
            current.map((character) => (character.id === updated.id ? updated : character)),
          )
        }
        onDelete={() => {
          setCharacters((current) => current.filter((character) => character.id !== selected.id));
          selectCharacter(null);
        }}
        onBack={() => selectCharacter(null)}
        onOpenSpells={() => setCharacterView('spells')}
      />
    );
  }

  return (
    <Dashboard
      characters={characters}
      onSelect={selectCharacter}
      onCreate={() => setCreating(true)}
    />
  );
}
