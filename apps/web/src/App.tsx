import { useCallback, useState } from "react";
import styles from "./App.module.css";
import { type Character, createCharacter } from "./character";
import { navigate, useRoute } from "./router";
import { CharacterEditorPage } from "./pages/CharacterEditorPage";
import { CharacterListPage } from "./pages/CharacterListPage";

/**
 * App shell: owns the (placeholder, in-memory) character collection and swaps
 * between the two routes. The collection lives here rather than in a page so it
 * survives list ⇄ editor navigation; step 2.2 lifts it into an IndexedDB store.
 */
export function App(): React.JSX.Element {
  const route = useRoute();
  const [characters, setCharacters] = useState<Character[]>([]);

  const handleCreate = useCallback((name: string) => {
    const character = createCharacter(name);
    setCharacters((prev) => [...prev, character]);
    navigate({ name: "editor", characterId: character.id });
  }, []);

  const handleDelete = useCallback((id: string) => {
    setCharacters((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <a className={styles.brand} href="#/">
          pc-manager
        </a>
        <span className={styles.tagline}>D&amp;D character manager</span>
      </header>

      <main className={styles.main}>
        {route.name === "list" ? (
          <CharacterListPage
            characters={characters}
            onCreate={handleCreate}
            onDelete={handleDelete}
          />
        ) : (
          <CharacterEditorPage
            character={characters.find((c) => c.id === route.characterId)}
          />
        )}
      </main>
    </div>
  );
}
