import { useEffect, useSyncExternalStore } from "react";
import { type CharacterStoreSnapshot, characterStore } from "./characterStore";

/**
 * Subscribe a component to the singleton character store and kick off hydration
 * on mount. Returns the current snapshot ({ status, characters }); components
 * mutate through `characterStore` directly.
 */
export function useCharacterStore(): CharacterStoreSnapshot {
  const snapshot = useSyncExternalStore(
    characterStore.subscribe,
    characterStore.getSnapshot,
    characterStore.getSnapshot,
  );

  useEffect(() => {
    // Idempotent: StrictMode's double-invoke just re-reads the database.
    void characterStore.hydrate();
  }, []);

  return snapshot;
}
