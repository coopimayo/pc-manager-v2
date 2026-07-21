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
  Champion subclass, its starting equipment, a set of feats (fighting styles,
  origin feats, and general feats including Ability Score Improvement), the
  Human and Elf species (the Elf with its Drow, High Elf, and Wood Elf
  lineages), the Soldier background, and two example characters.
- **Derivation layer** (`src/lib/derive.ts`) — folds a character and its content
  into a `Sheet`: ability scores with chosen and feat increases folded in (capped
  at 20) and their modifiers, proficiency bonus, initiative (feat
  `initiativeBonus` effects fold into the DEX modifier), hit points, skill
  modifiers, the character's feats (the Ability Score Improvement feat folds into
  the ability totals rather than appearing as a card), the features at level —
  the chosen subclass's features fold in by id — that aren't already shown as an
  ability, a granted feat, or a subclass choice, abilities grouped by activation
  cost — granted by class features or feats — with level-scaled uses resolved
  against class level and `'proficiencyBonus'` uses against the character's bonus
  (Lucky's Luck Points), and weapon attacks with their to-hit and damage (feat
  `attackRollBonus` effects fold into the to-hit). The background's fixed skills
  and origin feat fold in by id, and the species contributes its name and traits;
  ids that don't resolve are skipped.
- **UI** (`src/pages/`, `src/components/`) — a dashboard listing characters, and a
  character sheet with a click-to-spend use tracker on each limited-use ability
  and a **Level Up** button that re-derives the sheet. Leveling into a feat slot
  (like the level-4 ASI) opens a dialog to pick the feat and, for Ability Score
  Improvement, allocate the +2 / +1 increase; leveling into the level-3 subclass
  feature opens a dialog to pick a subclass (e.g. Champion). A **New Character**
  creator, reached from the dashboard, builds a level-1 character: name, species,
  background (with its +2/+1 ability allocation), class, standard-array ability
  scores, the class's skill picks (skills the background already grants are
  locked out), a starting-equipment package (its weapons become the sheet's
  attacks) and any level-1 feat choice such as the Fighter's Fighting Style —
  then opens the finished sheet.

Not yet built: more species and backgrounds (an example character references a
Criminal background that doesn't exist yet); spells; armour and AC; persistence
(created characters last only until a refresh).
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
    classes/          the Fighter, its features, Champion subclass and equipment
    species/          the Human, and the Elf with its lineages
    backgrounds/      the Soldier
    items/            weapons, armour and gear
    characters/       example characters
  lib/                framework-agnostic logic
    derive.ts         character + content -> Sheet
    format.ts         shared display helpers (signed, titleCase)
    skill-abilities.ts  which ability governs each skill
  pages/              one folder per screen; each index re-exports the
                      component and holds the page's helper functions
    Dashboard/        the character list
    CharacterCreator/ the new-character form
    CharacterSheet/   the derived sheet
  components/         reusable presentational components
    FeatChoiceDialog/ the level-up feat picker + ASI allocator
    SubclassChoiceDialog/ the level-3 subclass picker
  hooks/              reusable React hooks
  styles/             global CSS
  test/setup.ts       Vitest setup (jest-dom matchers, cleanup)
```

Component styles use CSS Modules (`*.module.css`), colocated with the component
that uses them; app-wide styles live in `src/styles/global.css`.

Navigation is a `useState` in `App.tsx`, not a router — there is no URL per
character, and a refresh returns to the dashboard.

Player edits — spent ability uses, and **Level Up** (which raises the primary
class level and can add a chosen feat with its ability-score increases, or a
chosen subclass) — are
held in local `useState` in `CharacterSheet`. Leaving the sheet discards them,
since there is no persistence yet. Created characters are appended to a
`useState` list in `App`, so they survive navigation but not a refresh.

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
- `derive` skips content ids it can't resolve, so a typo yields a plausible
  sheet with 0 hit points rather than an error.
- A trait that offers a choice has no `Effect` kind, so the Human's Skillful
  ("one skill of your choice") is display-only; its Versatile trait declares a
  `grantFeat` for an origin feat, but nothing prompts for it yet. The creator
  also ignores the background's starting equipment and tool proficiency.
- The `Effect` union covers no species mechanics, so every Elf and lineage trait
  is display-only: there's no kind for a sense (Darkvision), a conditional-save
  advantage (Fey Ancestry), a rest change (Trance), a speed override (Wood Elf),
  a skill choice constrained to a named set (Keen Senses' three skills), or a
  spell grant that is level-gated with a choose-your-casting-ability (the
  lineages' spells) — and there are no spells to grant yet.
- `ClassFeature` and a granted ability each carry their own name and
  description, so Second Wind's name and text are authored twice. Every feature
  now reaches `Sheet.features`, so an ability-granting feature shows under both
  Actions and Features until the player hides the card they don't want.
