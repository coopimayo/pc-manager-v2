# pc-manager-v2

A local-first Dungeons & Dragons player-character creator and manager, modelled
on the 2024 ruleset. Single web app — Vite + React + TypeScript.

## Status

Early days. What exists today:

- **Project scaffold** — Vite + React + TypeScript app, strict TS, Vitest.
- **Domain type model** (`src/types/`) — the declarative data vocabulary for
  characters and the content they're built from (classes, species, backgrounds,
  feats, items). Fully documented in [docs/domain-model.md](docs/domain-model.md).

Not yet built: content data, the derivation/rules layer, and the creator UI.
See [Not yet modelled](docs/domain-model.md#not-yet-modelled) for what's next.

## Development

```sh
npm install
npm run dev        # dev server (http://localhost:5173)
npm test           # run the test suite once (Vitest)
npm run test:watch # watch mode
npm run typecheck  # strict TypeScript check (tsc -b, no emit)
npm run build      # typecheck + production build to dist/
npm run preview    # serve the production build locally
```

## Layout

```
index.html            Vite entry HTML
src/
  main.tsx            React bootstrap (mounts <App>)
  App.tsx             root component
  types/              domain type model — see docs/domain-model.md
  components/         reusable presentational components
  pages/              route-level / screen components
  hooks/              reusable React hooks
  lib/                framework-agnostic logic and helpers
  styles/             global CSS
  test/setup.ts       Vitest setup (jest-dom matchers, cleanup)
```

Component styles use CSS Modules (`*.module.css`); app-wide styles live in
`src/styles/global.css`.

## Domain model

The type model is the heart of the project so far: plain, declarative data
describing D&D content, kept strictly separate from the character *instance*
that references it. The guiding ideas —

- **Content is referenced by id.** A `Character` points at a species, classes,
  a background and feats by their ids; it never embeds their definitions.
- **Creation decisions are `Choice<T>`.** "Choose 2 skills from a list" or
  "starting equipment A or B" share one generic shape.
- **Mechanical benefits are `Effect`s.** A shared discriminated union carried by
  feats, traits and class features — text for display, effects for behaviour.
- **Derived values are never stored.** Modifiers, AC, HP, etc. are computed from
  the character plus content (that layer isn't built yet).

Full reference, including every entity and its fields:
**[docs/domain-model.md](docs/domain-model.md)**.
