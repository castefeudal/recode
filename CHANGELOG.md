# Changelog

## Unreleased — premium product rebuild

- Added a Daily Command Center built around `STATE → PRIORITY → ACTION → WORLD`, with transparent readiness, `WHY THIS`, honest alternatives and a visible world-response loop.
- Added a rule-based recommendation engine that lowers confidence when history is sparse instead of fabricating personal insight.
- Added a non-punitive Return Protocol with 3 / 10 / 25 minute return scales, preserved progress and story-readable return flags.
- Added Weekly Review with wins, friction, returns, sleep trend, next focus and explicit non-causal labeling for observed associations.
- Added structured Training: workout builder, templates, reordering, sets/reps/rest, session mode, real load/reps/RIR set records, previous performance and local session history.
- Connected completed structured workouts back to the existing Life RPG state so Today/Weekly Review/story flags can react to real training.
- Added isolated local training storage with a backup copy instead of destructively changing the existing v6 save schema.
- Added automated tests for recommendations, no-fake-insight review behavior, Return Protocol and structured training state transitions.
- Reworked the GitHub Pages workflow to operate from `web_app`, use the required Node 22 runtime and gate deployment on typecheck, lint, tests/build and source validation.
- Updated the project validator so the campaign-runtime check understands the existing GitHub Pages `BASE_PATH` fetch while still requiring a real runtime fetch of `season_01.json`.

## 7.0.0 visual system upgrade — 2026-08-03

- Introduced a cinematic industrial editorial design system with semantic dark, light and high-contrast themes.
- Added typed iconography, 29 required component families, motion/focus/touch foundations and responsive safe-area behaviour.
- Reworked landing, onboarding, application shell, dashboard, narrative, action, progress, private-data and cloud/account surfaces.
- Added static Chromium screenshot evidence, layout/touch/accessibility contract audits, CSS parsing and TypeScript transpile checks.
- Added nine design documents, before/after evidence and an explicit limitations record.
- Preserved the existing source gate; production React build, axe, Lighthouse and device/store validation remain external owner gates.

## 7.0.0 remediation — 2026-08-03

- Synchronized release truth and restored 71/71 project gates.
- Added strict source/full verification, clean CI provisioning and self-checking packaging.
- Extracted Web storage/cloud adapters and aligned revision-conflict/privacy contracts.
- Hardened backend configuration, tokens, sessions, readiness, metrics and transactions.
- Removed false native availability and added explicit owner-gate/evidence packages.

## 6.0.0 — 2026-07-29

### Product and visual

- Rebuilt the landing around an interactive `CHOICE → ACTION → WORLD` proof.
- Added dedicated cinematic desktop hero, mobile hero and Meridian cast art
  with AVIF/WebP/PNG production fallbacks.
- Added a visible first-session trajectory strip, brand icons and social card.

### UX, accessibility and PWA

- Added explicit high-contrast mode and verified bilingual accessible names.
- Added service-worker update detection/activation banner and richer manifest.
- Browser-verified consent, four origins, identity, story choice, real action,
  World response, RU/EN and contrast.

### Data, engineering and QA

- Introduced save schema 6 with v3/v4/v5 migrations in Web and matching journey
  state in Godot source.
- Increased save cycles and malformed fuzz to 1,000 each.
- Increased balance coverage to 5,040 runs; detected and fixed one
  action-concentration regression.
- Added TypeScript gate, responsive art budgets, Next.js 16.2.12 and Media Kit.
- Updated backend API to 6.0.0 and rebuilt SBOM/provenance/release evidence.

## 5.0.0 — 2026-07-29

### Product and UX

- Added explicit unchecked onboarding consent and plain-language data boundary.
- Added return as the fifth visible core-loop stage.
- Added online/offline state, skip links, progress semantics, live status and
  current-page navigation.
- Added save-write failure recovery copy.

### Narrative and balance

- Rebuilt all 140 scenes with scene-specific openings; automated audit now has
  zero repeated openings and zero short-copy warnings.
- Preserved 14/140/420/70, 30 branches, 20 closures, 89 variants and 8 endings.
- Replaced 56-run model with 1 200 seeded runs across 10 archetypes, 4 origins
  and 30/90/180-day horizons; retained the initial failing run and passing retest.

### Save/PWA

- Introduced save schema v5 and v3/v4→v5 migration.
- Increased soak to 500 cycles and added 500 malformed/future/Unicode fuzz cases.
- Moved service-worker activation to an explicit message instead of automatic
  `skipWaiting` during install.
- Godot source now writes pending→flush→backup→rename and falls back from
  corrupted primary to backup.

### Backend

- API version 5.0.0, 1 MiB request cap and security headers on early errors.
- `BEGIN IMMEDIATE` serializes optimistic revision checks.
- Added simultaneous-write conflict proof, oversized-body test and 100-request
  local concurrent health load with p95 <500 ms gate.

### Creator Studio

- Added immediate metadata autosave; browser reload now restores edited title.
- Browser-verified RU/EN edit, prose/dialogue/choices, duplicate, undo/redo,
  autosave/reload, graph validation and orphan rejection.
- Added canonical JSON roundtrip plus duplicate/orphan/unsafe-path/XSS tests.

### Release

- Revalidated production build and existing Sites project.
- Updated root documentation, truth audit, scorecard, release archives, SBOM,
  provenance and SHA-256 manifest.

## 4.0.0 — 2026-07-27

Runtime content split, deterministic graph/balance/editorial validators,
50-cycle save test, real backend lifecycle test and six verified archives.
