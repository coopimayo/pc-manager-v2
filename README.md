# pc-manager-v2

A D&D player-character creator and manager built as a **data-driven rules
engine**: the character sheet is a pure derivation of content packs plus an
event-sourced build log, every derived number carries provenance, and all
rules content (species, subspecies, classes, subclasses, feats, backgrounds)
is declarative data — no class-specific engine code.

Design plan and milestones: [docs/PLAN.md](docs/PLAN.md).

## Layout

- `packages/engine` — pure TypeScript rules engine: `derive(packs, buildLog, playState)`,
  zod schemas for content packs, no I/O, no framework dependencies.
- `packages/content-srd` — SRD 5.2 content pack (CC-BY 4.0, attribution embedded).
- `apps/web` — (upcoming, M2) React local-first creation wizard and sheet.

## Development

```sh
npm install
npm test          # all workspace tests (engine unit + golden characters + pack validation)
npm run typecheck
```

## Licensing

SRD 5.2 content is used under the Creative Commons Attribution 4.0
International License; the required attribution is embedded in the content
pack and surfaced on every derived sheet. No non-SRD content ships in this
repo.
