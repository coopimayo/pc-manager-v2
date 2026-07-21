import { useEffect, useState } from 'react';

import { characters as initialCharacters } from '../data/characters';
import type { Character } from '../types';

const STORAGE_KEY = 'pc-manager:characters';

function normalize(character: Character): Character {
  return { ...character, spellbook: character.spellbook ?? { knownSpellIds: [] } };
}

function load(): Character[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Character[]).map(normalize) : initialCharacters;
  } catch {
    return initialCharacters;
  }
}

export function usePersistentCharacters() {
  const [characters, setCharacters] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
    } catch {
      // no-op
    }
  }, [characters]);

  return [characters, setCharacters] as const;
}
