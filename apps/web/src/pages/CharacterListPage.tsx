import { type ChangeEvent, type FormEvent, useRef, useState } from "react";
import { type Character } from "../character";
import { type ImportResult, serializeCharacter } from "../characterFile";
import { routeToHash } from "../router";
import styles from "./CharacterListPage.module.css";

interface Props {
  characters: Character[];
  loading: boolean;
  onCreate: (name: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDuplicate: (id: string) => void;
  onImport: (json: string) => Promise<ImportResult>;
}

/** Download a character as a JSON file the user can re-import later. */
function downloadCharacter(character: Character): void {
  const blob = new Blob([serializeCharacter(character)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${character.name.replace(/[^\w.-]+/g, "_") || "character"}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function CharacterListPage({
  characters,
  loading,
  onCreate,
  onDelete,
  onRename,
  onDuplicate,
  onImport,
}: Props): React.JSX.Element {
  const [name, setName] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setName("");
  }

  // Inline rename via a prompt — an interim affordance; polished editing lands
  // with the sheet view (roadmap 2.5).
  function handleRename(character: Character): void {
    const next = window.prompt("Rename character", character.name);
    const trimmed = next?.trim();
    if (trimmed && trimmed !== character.name) onRename(character.id, trimmed);
  }

  async function handleImportFile(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-importing the same file
    if (!file) return;
    setImportError(null);
    const result = await onImport(await file.text());
    if (!result.ok) setImportError(result.error);
  }

  return (
    <section className={styles.page}>
      <h1 className={styles.heading}>Characters</h1>

      <form className={styles.newForm} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          type="text"
          placeholder="New character name"
          aria-label="New character name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <button className={styles.primary} type="submit" disabled={!name.trim()}>
          Create
        </button>
        <button
          className={styles.delete}
          type="button"
          onClick={() => fileInputRef.current?.click()}
        >
          Import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          aria-label="Import character file"
          hidden
          onChange={handleImportFile}
        />
      </form>

      {importError && (
        <p className={styles.error} role="alert">
          {importError}
        </p>
      )}

      {loading ? (
        <p className={styles.empty}>Loading…</p>
      ) : characters.length === 0 ? (
        <p className={styles.empty}>No characters yet. Create one to get started.</p>
      ) : (
        <ul className={styles.list}>
          {characters.map((character) => (
            <li key={character.id} className={styles.row}>
              <a
                className={styles.link}
                href={routeToHash({ name: "editor", characterId: character.id })}
              >
                {character.name}
              </a>
              <span className={styles.actions}>
                <button
                  className={styles.action}
                  type="button"
                  aria-label={`Rename ${character.name}`}
                  onClick={() => handleRename(character)}
                >
                  Rename
                </button>
                <button
                  className={styles.action}
                  type="button"
                  aria-label={`Duplicate ${character.name}`}
                  onClick={() => onDuplicate(character.id)}
                >
                  Duplicate
                </button>
                <button
                  className={styles.action}
                  type="button"
                  aria-label={`Export ${character.name}`}
                  onClick={() => downloadCharacter(character)}
                >
                  Export
                </button>
                <button
                  className={styles.delete}
                  type="button"
                  aria-label={`Delete ${character.name}`}
                  onClick={() => onDelete(character.id)}
                >
                  Delete
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
