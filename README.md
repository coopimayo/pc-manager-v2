# pc-manager-v2

A local-first D&D player-character creator and manager. Single web app —
Vite + React + TypeScript.

## Development

```sh
npm install
npm run dev        # start the dev server (http://localhost:5173)
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
  components/         reusable presentational components
  pages/              route-level / screen components
  hooks/              reusable React hooks
  lib/                framework-agnostic logic and helpers
  styles/             global CSS
  test/setup.ts       Vitest setup (jest-dom matchers, cleanup)
```

Component styles use CSS Modules (`*.module.css`); app-wide styles live in
`src/styles/global.css`.
