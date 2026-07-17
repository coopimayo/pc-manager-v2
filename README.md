# pc-manager-v2

A local-first Dungeons & Dragons player-character creator and manager, modelled
on the 2024 ruleset. Single web app — Vite + React + TypeScript.

## Status

Early, but end-to-end: the app renders a real character sheet computed from the
type model. What exists today:

- **Project scaffold** — Vite + React + TypeScript app, strict TS, Vitest.
- **Domain type model** (`src/types/`) — the declarative data vocabulary for
  characters and the content they're built from (classes, species, backgrounds,
  feats, items). One type per file. Fully documented in
  [docs/domain-model.md](docs/domain-model.md).
- **Content data** (`src/data/`) — the Fighter class through level 5, its
  starting equipment, and two example characters.
- **Derivation layer** (`src/lib/derive.ts`) — folds a character and its content
  into a `Sheet`: ability modifiers, proficiency bonus, hit points, skill
  modifiers, the features at level that aren't already listed as an ability,
  abilities grouped by activation cost, and weapon attacks with their to-hit
  and damage (feat `attackRollBonus` effects fold into the to-hit).
- **UI** (`src/pages/`) — a dashboard listing characters, and a character sheet
  with a click-to-spend use tracker on each limited-use ability.

Not yet built: species, background and feat data; spells; armour and AC;
character *creation* (the app only reads hardcoded characters); persistence.
See [Not yet modelled](docs/domain-model.md#not-yet-modelled) for the rest.

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
  App.tsx             shell — dashboard, or a sheet once a character is picked
  types/              domain type model — see docs/domain-model.md
  data/               content instances and example characters
    classes/          the Fighter, its features and starting equipment
    items/            weapons, armour and gear
    characters/       example characters
  lib/                framework-agnostic logic
    derive.ts         character + content -> Sheet
    skill-abilities.ts  which ability governs each skill
  pages/              one folder per screen, each with a barrel
    Dashboard/        the character list
    CharacterSheet/   the derived sheet
  components/         reusable presentational components
  hooks/              reusable React hooks
  styles/             global CSS
  test/setup.ts       Vitest setup (jest-dom matchers, cleanup)
```

Component styles use CSS Modules (`*.module.css`), colocated with the component
that uses them; app-wide styles live in `src/styles/global.css`.

Navigation is a `useState` in `App.tsx`, not a router — there is no URL per
character, and a refresh returns to the dashboard.

Spent ability uses are the one piece of mutable player state, held in a
`useState` in `CharacterSheet` and keyed by ability name. Leaving the sheet
resets every counter, since there is no persistence yet.

## Domain model

The type model is the heart of the project: plain, declarative data describing
D&D content, kept strictly separate from the character *instance* that
references it. The guiding ideas —

- **Content is referenced by id.** A `Character` points at a species, classes,
  a background and feats by their ids; it never embeds their definitions.
- **Creation decisions are `Choice<T>`.** "Choose 2 skills from a list" or
  "starting equipment A or B" share one generic shape.
- **Mechanical benefits are `Effect`s.** A shared discriminated union carried by
  feats, traits and class features — text for display, effects for behaviour.
  An `Effect` that grants something the character can *do* carries an
  `Activation` (action, bonus action, reaction, free, passive) and optional
  `Uses`, rather than a separate effect kind per action type.
- **Derived values are never stored.** Modifiers, hit points, skill bonuses and
  the action list are computed by `src/lib/derive.ts` from the character plus
  its content.

Full reference, including every entity and its fields:
**[docs/domain-model.md](docs/domain-model.md)**.

## Known gaps

Things the current model can't yet express, found by building real data against
it:

- Weapon and armour proficiencies are lists of item *names*, but D&D grants them
  by category ("all Simple weapons"). The Fighter stores category labels as a
  stand-in. Because of this, derived attacks *assume* the character is proficient
  with every weapon they carry — true for the Fighter, wrong for anyone dabbling
  outside their proficiencies.
- `EquipmentPackage.items` has no quantity, so "8 javelins" isn't expressible.
- Feature uses that scale with level (Second Wind's 2 -> 3 at level 4) — `Uses.count`
  is a plain number.
- `derive` skips content ids it can't resolve, so a typo yields a plausible
  sheet with 0 hit points rather than an error.
- `ClassFeature` and a granted ability each carry their own name and
  description, so Second Wind's name and text are authored twice. `derive`
  drops a feature from `Sheet.features` once it grants an ability, which stops
  the sheet repeating itself but means the feature's fuller wording — the part
  covering Tactical Mind's interaction, say — never reaches the page.
