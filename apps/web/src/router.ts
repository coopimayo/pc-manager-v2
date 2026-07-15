import { useMemo, useSyncExternalStore } from "react";

/**
 * Minimal hash-based router. Two destinations for now — the character list and
 * the character editor — which is all M2 needs. Hash routing keeps the app a
 * static, backend-free bundle that works from any path (roadmap 2.1). Swap for
 * a real router only when the route space actually grows.
 */
export type Route =
  | { name: "list" }
  | { name: "editor"; characterId: string };

function parseHash(hash: string): Route {
  const segments = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  if (segments[0] === "characters" && segments[1]) {
    return { name: "editor", characterId: decodeURIComponent(segments[1]) };
  }
  return { name: "list" };
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case "editor":
      return `#/characters/${encodeURIComponent(route.characterId)}`;
    case "list":
      return "#/";
  }
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function getHashSnapshot(): string {
  return window.location.hash;
}

/** Current route, re-rendering the caller whenever the URL hash changes. */
export function useRoute(): Route {
  // Snapshot is the raw hash string (a stable primitive), so useSyncExternalStore
  // never sees a "changed" value between renders; the Route is memoized from it.
  const hash = useSyncExternalStore(subscribe, getHashSnapshot, () => "");
  return useMemo(() => parseHash(hash), [hash]);
}

/** Navigate by updating the URL hash; the hashchange event drives re-render. */
export function navigate(route: Route): void {
  const hash = routeToHash(route);
  if (window.location.hash !== hash) {
    window.location.hash = hash;
  }
}
