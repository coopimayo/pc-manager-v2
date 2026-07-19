---
name: verify
description: Launch and drive pc-manager-v2 in a headless browser to verify changes at the UI surface
---

# Verifying pc-manager-v2

- Launch: `npm run dev` in the background. Vite falls back to the next free
  port when 5173 is busy — read the task output for the real URL before
  driving.
- The repo has no browser-driving dependency. A Playwright install usually
  exists in the npx cache; find it and symlink it into a scratchpad
  `node_modules` (ESM imports ignore `NODE_PATH`):

  ```sh
  for d in ~/.npm/_npx/*/node_modules; do [ -d "$d/playwright" ] && echo "$d"; done
  mkdir -p "$SCRATCH/node_modules"
  ln -sfn "$FOUND/playwright" "$SCRATCH/node_modules/playwright"
  ln -sfn "$FOUND/playwright-core" "$SCRATCH/node_modules/playwright-core"
  ```

  Then run a `.mjs` script from the scratchpad with
  `import { chromium } from 'playwright'`.
- Navigation is in-memory `useState`, not a router: every flow starts at the
  dashboard and a page reload resets to it. Drive dashboard → card/button
  clicks; there are no URLs per screen.
- Locator notes: almost everything is a `button` findable by role + accessible
  name; the creator's ability selects have ids `#ability-str` … `#ability-cha`
  and label text `STR` … `CHA`.
