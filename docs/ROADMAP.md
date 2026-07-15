# pc-manager-v2 — Execution Roadmap

Step-by-step plan for everything after M0/M1 (engine skeleton + Fighter/Champion
vertical slice, done 2026-07-15). Design rationale lives in [PLAN.md](PLAN.md);
this document is the ordered work list. Sizes are rough: **S** = an hour or two,
**M** = a session, **L** = several sessions.

**A note on ordering:** the original plan put "all 12 classes" before
spellcasting. That doesn't work — 8 of the 12 SRD classes cast spells. The
sequence below does martial classes first (M4), builds the spellcasting engine
(M5), then ships the casters (M5), and pushes equipment and play-state after
that. Each milestone ends with the app in a releasable state.

---

## M2 — Creation wizard (local-first web app)

Goal: create a level 1 character end-to-end in the browser; reload persists it.

### 2.1 App scaffolding — S ✅
- [x] `apps/web`: Vite + React + TS, workspace deps on `@pc-manager/engine`
      and `@pc-manager/content-srd`; strict tsconfig extending the base.
- [x] Minimal router (character list ⇄ character editor). No CSS framework
      decision needed yet — plain CSS modules until the sheet view forces one.
      *(Hand-rolled hash router — `src/router.ts`; no routing dependency until
      the route space grows.)*

### 2.2 Character store (persistence) — M ✅
- [x] Character file format: `{ id, name, packIds, buildLog, createdAt, updatedAt, formatVersion }`.
      The build log **is** the character; nothing derived is ever stored.
      *(`apps/web/src/character.ts`; `name` is a denormalised label kept in sync
      with the `characterCreated` event by `renameCharacter`.)*
- [x] IndexedDB store (via `idb`): list / create / rename / duplicate / delete.
      *(`store/db.ts` = dumb adapter; `store/characterStore.ts` = reactive
      singleton built as a factory over a `CharacterDb` for isolated tests.)*
- [x] Append-event and truncate-log operations as the only mutation API;
      autosave on every change. *(Every store mutation writes cache + IndexedDB
      together; the `useCharacterStore` hook drives the UI via
      `useSyncExternalStore`.)*
- [x] JSON export/import with schema validation and `formatVersion` migration
      hook (empty for now). Round-trip test. *(`characterFile.ts`; build events
      validated against the engine's new `buildEventSchema`; import is additive —
      a colliding id gets a fresh one.)*

### 2.3 Generic decision UI — L (the heart of the app) ✅
- [x] `<DecisionCard>` renders any `PendingDecision`: prompt, option grid,
      ineligible options greyed out with their `reason`, selection enforcing
      `count` / `allowDuplicates` / `maxPerOption` before enabling Confirm.
      *(`components/DecisionCard.tsx`; two interaction modes — click-to-toggle
      with single-select radio behaviour, and a per-option stepper for
      duplicate-allowed decisions like ASI +1/+1. All mechanics live in the pure
      `components/decisionSelection.ts` module, so the component is thin render.)*
- [x] Confirm appends `decisionResolved`, re-derives, and newly-opened
      decisions (e.g. Elf → lineage) appear in place. No content-specific code.
      *(Editor renders `pendingDecisions` as cards; App wires resolve →
      `characterStore.appendEvent`. Cards are keyed by `instanceId` so nested
      decisions mount with fresh state.)*
- [x] Searchable/filterable option list once options exceed ~12 (needed for
      feats now, spells later). *(`SEARCH_THRESHOLD`; case-insensitive label
      substring filter.)*
- [x] Component tests: count enforcement, duplicate rules, nested decision
      appearance, eligibility rendering. *(Component logic extracted to the pure
      `decisionSelection` module and unit-tested in the node env — matching the
      engine/store testing style; nested-decision appearance verified at the
      derive boundary in `decisionFlow.test.ts`. Full DOM/browser testing is
      deliberately deferred to M3.5, where the E2E framework is chosen.)*

### 2.4 Creation flow — M
- [ ] Stepper in 2024 creation order: class → background → species → ability
      scores → details (name etc.). Steps are *views over pending decisions*,
      not hard-coded forms — the stepper just groups decisions by their source.
- [ ] Ability score step: standard array assignment, point buy (27 points,
      8–15 costs), manual entry. Emits one `abilityScoresSet` event.
- [ ] Live mini-sheet side panel re-deriving on every event.
- [ ] Completion state: scores set + no pending decisions → "complete" badge;
      otherwise show what's missing (drawn from `pendingDecisions`).

### 2.5 Sheet view — M
- [ ] Full read-only sheet: abilities, saves, skills, HP/AC/initiative/speed,
      features grouped by source, proficiencies, feats, attribution footer.
- [ ] **Provenance popover on every number** (`DerivedValue.parts`) — this is
      the flagship feature; build it as one reusable `<Stat>` component.
- [ ] Findings rendered as banners (errors) and badges (warnings).

### M2 acceptance
- Create the golden Champion Fighter's level 1 state entirely through the UI;
  reload the browser and it's still there; export → delete → import restores it.

---

## M3 — Level-up flow

Goal: the golden character can go 1 → 7 entirely in the UI; undo works.

- [ ] **3.1 — M** "Level Up" action: class picker (existing classes first,
      multiclass options gated by prerequisites with reasons shown), HP choice
      (average default, or enter a roll → `hpRoll`), appends `classLevelTaken`.
- [ ] **3.2 — S** New pending decisions (subclass at 3, feat slots, epic boon)
      resolve through the existing `<DecisionCard>` — verify zero new UI code
      is needed; if any is, that's an engine/content bug to fix, not UI to add.
- [ ] **3.3 — M** Build-log timeline view: every event in order, human-readable
      ("Chose Champion", "+1 STR from Soldier"), with what it contributed.
- [ ] **3.4 — M** Undo = truncate the log at a chosen event (with preview of
      what gets lost, since later events may reference now-gone decisions —
      surface resulting findings before confirming).
- [ ] **3.5 — S** Multi-character regression: a Wood Elf and a multiclass
      build as UI-driven end-to-end tests (Playwright or vitest browser mode —
      decide here, it's the first E2E need).

### M3 acceptance
- Golden character driven 1 → 7 in the browser matching the golden test's
  numbers; truncating back to level 5 restores the level-5 sheet exactly.

---

## M4 — Martial classes + remaining species + fidelity pass

Goal: every non-caster SRD class playable; all 9 species in; content verified.

### 4.1 SRD fidelity pass — M (do this first; it may correct M1 content)
- [ ] Obtain the published SRD 5.2 document and verify every existing entity
      (M1 content was paraphrased from model knowledge). Fix names, numbers,
      feature text, feat lists. Record corrections in the pack changelog.
- [ ] Backgrounds must grant their *specific* Magic Initiate list (Acolyte →
      Cleric, Sage → Wizard): needs a `grantFeat` mechanism to pre-resolve the
      feat's nested decision (currently the player picks the list freely).

### 4.2 Engine capabilities the martial classes force — L
Design each as a small ADR in `docs/adr/` before implementing:
- [ ] **Expertise**: proficiency ranks (none/proficient/expert) instead of the
      current boolean set; `grantProficiency` gains an optional `rank`.
- [ ] **Alternative AC formulas** (Barbarian/Monk Unarmored Defense): content
      declares candidate AC formulas (`"10 + dexMod + conMod"`); engine derives
      all candidates and uses the best, with the winner named in provenance.
- [ ] **Resource counters** (Rage uses, Focus/Ki, Second Wind uses): a
      `grantResource` effect (`id`, `max` formula, reset: short/long rest).
      Derived onto the sheet now; *consumption* is play-state (M7).
- [ ] **Scaling values** (Martial Arts die, Sneak Attack dice): expressible as
      per-level `setStat` today — confirm that's sufficient, don't build more.

### 4.3 Content: species — M
- [ ] Dragonborn (Draconic Ancestry as a 10-option list decision → breath
      weapon + resistance features), Goliath (Giant Ancestry decision),
      Gnome (2 lineages as subspecies), Tiefling (3 legacies as subspecies).

### 4.4 Content: classes — L
- [ ] Barbarian 1–20 + Path of the Berserker (rage resource, Unarmored Defense).
- [ ] Rogue 1–20 + Thief (Expertise, Sneak Attack scaling).
- [ ] Monk 1–20 + Warrior of the Open Hand (Focus resource, Martial Arts die,
      Unarmored Defense).
- [ ] Golden character test per class, numbers checked by hand, plus a
      multiclass golden (e.g. Fighter/Rogue) exercising the multiclass rules.

### M4 acceptance
- 4 classes, 9 species, all subspecies; pack validation green; golden per class.

---

## M5 — Spellcasting engine + the eight caster classes

Goal: all 12 SRD classes playable. The largest remaining engine work.

### 5.1 Spellcasting data model — L (ADR first; the key design step)
- [ ] `SpellEntity` (level, school, lists, casting time, components, text) and
      schema; spell-list membership as data.
- [ ] `grantSpellcasting` effect: ability, prepared-vs-known model, slot table
      reference, cantrips-known / prepared-count formulas, ritual casting flag.
- [ ] Slot tables as data (full caster, half caster, Warlock pact magic);
      **multiclass slot computation** from combined caster levels.
- [ ] Spell selection as ordinary DecisionPoints with a `spell` entity query
      (level ≤ X, list = Y) — the wizard UI already handles it (2.3 search).
- [ ] Sheet: spellcasting block per class (save DC, attack mod, slots,
      prepared/known lists) with provenance on DC/attack.

### 5.2 Full casters — L
- [ ] SRD spells for the needed lists (start with levels 0–5, extend upward as
      class levels demand — shipping Wizard 1–20 needs all 9 levels).
- [ ] Wizard/Evoker, Cleric/Life, Druid/Land, Sorcerer/Draconic, Bard/Lore,
      Warlock/Fiend (pact magic slots are the stress test).

### 5.3 Half casters + species spells — M
- [ ] Paladin/Devotion, Ranger/Hunter; multiclass slot golden test
      (e.g. Paladin 2 / Wizard 3 → 3rd-level slots as a full-caster-5 would... 
      verify against the actual multiclass table, not intuition).
- [ ] Replace the "spellcasting arrives later" feature-text placeholders in
      species lineages and Magic Initiate with real spell grants.

### M5 acceptance
- All 12 classes 1–20; golden caster characters (incl. one multiclass caster);
  every M1 placeholder text about deferred spells is gone.

---

## M6 — Equipment & inventory

Goal: AC comes from actual armor; attacks appear on the sheet.

- [ ] **6.1 — M** ADR: equipment as build-log events vs. separate inventory
      log (lean: separate `inventoryLog`, same event-sourced pattern — gear
      changes constantly and shouldn't pollute build history).
- [ ] **6.2 — M** Item entities: weapons (damage, properties, mastery), armor
      (AC formula, dex cap, strength req, stealth disadvantage), shields, gear.
- [ ] **6.3 — M** Engine: equipped-armor AC replaces the base formula
      (alternative-AC mechanism from 4.2 generalizes); attack rows derived per
      equipped weapon (to-hit, damage, with provenance).
- [ ] **6.4 — S** Weapon Mastery: the Fighter's mastery-weapon picks become a
      real decision over weapon entities (replacing M1 placeholder text).
- [ ] **6.5 — M** Inventory UI + background/class starting equipment choices.

---

## M7 — Play state (the "at the table" layer)

Goal: the sheet is useful mid-session, not just between sessions.

- [ ] **7.1 — M** ADR + implementation: `PlayState` becomes real — current HP,
      temp HP, conditions, concentration, active effects, resource pools,
      death saves, heroic inspiration. Separate from the build log; freely
      resettable.
- [ ] **7.2 — M** Conditions as content (SRD conditions pack) whose effects
      flow through the same Effect pipeline → "you have disadvantage on X
      because Poisoned" appears with provenance like everything else.
- [ ] **7.3 — M** Rest actions: short/long rest reset resources per their
      reset rules; hit dice spending.
- [ ] **7.4 — M** Active-effects panel + quick actions (damage/heal, add
      condition, drop concentration).

---

## M8 — Homebrew & polish

- [ ] **8.1 — M** Homebrew pack import: JSON validated by the existing zod
      schemas with human-readable error reporting; per-character pack opt-in;
      id-collision handling across packs.
- [ ] **8.2 — L** (stretch) In-app homebrew editor for the simple entity types
      (feats, species) — the schemas drive the form.
- [ ] **8.3 — M** Sheet print/PDF layout.
- [ ] **8.4 — M** Accessibility + mobile pass; PWA manifest for offline.

---

## Cross-cutting (start now, not at the end)

- [ ] **Initial git commit** — the repo has no commits; commit M0/M1 as the
      baseline, then commit per roadmap step. *(Blocked on: user go-ahead.)*
- [ ] **CI** (GitHub Actions or equivalent): `npm test` + `npm run typecheck`
      on every push, from M2 onward. Pack validation is already a test, so
      content PRs get checked for free.
- [ ] **ADR habit**: every engine vocabulary extension (new Effect kind, new
      entity type) gets a one-page ADR in `docs/adr/` — the Effect vocabulary
      staying small and closed is the project's core bet.
- [ ] **Golden character suite** grows with every class/subclass; it is the
      regression net for engine refactors.
- [ ] **Version the character file format** from the first M2 release; write
      a migration whenever `BuildEvent` or the file shape changes.

## Deliberately out of scope (unless goals change)

Combat automation (rolling, action economy), VTT integrations, cloud sync and
accounts (the file format keeps sync tractable later), non-SRD content of any
kind, and rules versions other than 2024/SRD 5.2.
