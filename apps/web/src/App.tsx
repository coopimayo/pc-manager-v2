import { useCallback } from "react";
import styles from "./App.module.css";
import { navigate, useRoute } from "./router";
import { characterStore } from "./store/characterStore";
import { useCharacterStore } from "./store/useCharacterStore";
import { CharacterEditorPage } from "./pages/CharacterEditorPage";
import { CharacterListPage } from "./pages/CharacterListPage";

/**
 * App shell: swaps between the two routes over the persistent character store.
 * The store (not React state) owns the collection, so it survives reloads and
 * list ⇄ editor navigation; every handler here just calls the store's mutation
 * API, which autosaves to IndexedDB.
 */
export function App(): React.JSX.Element {
  const route = useRoute();
  const { status, characters } = useCharacterStore();

  const handleCreate = useCallback(async (name: string) => {
    const character = await characterStore.create(name);
    navigate({ name: "editor", characterId: character.id });
  }, []);

  const handleDelete = useCallback((id: string) => {
    void characterStore.remove(id);
  }, []);

  const handleRename = useCallback((id: string, name: string) => {
    void characterStore.rename(id, name);
  }, []);

  const handleDuplicate = useCallback((id: string) => {
    void characterStore.duplicate(id);
  }, []);

  const handleImport = useCallback((json: string) => characterStore.importFile(json), []);

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
            loading={status === "loading"}
            onCreate={handleCreate}
            onDelete={handleDelete}
            onRename={handleRename}
            onDuplicate={handleDuplicate}
            onImport={handleImport}
          />
        ) : (
          <CharacterEditorPage
            character={characters.find((c) => c.id === route.characterId)}
            loading={status === "loading"}
          />
        )}
      </main>
    </div>
  );
}
