import { type FormEvent, useState } from "react";
import { type Character } from "../character";
import { routeToHash } from "../router";
import styles from "./CharacterListPage.module.css";

interface Props {
  characters: Character[];
  onCreate: (name: string) => void;
  onDelete: (id: string) => void;
}

export function CharacterListPage({ characters, onCreate, onDelete }: Props): React.JSX.Element {
  const [name, setName] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setName("");
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
      </form>

      {characters.length === 0 ? (
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
              <button
                className={styles.delete}
                type="button"
                aria-label={`Delete ${character.name}`}
                onClick={() => onDelete(character.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
