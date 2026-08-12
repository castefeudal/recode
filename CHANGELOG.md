# Changelog

## Unreleased — Premium product rebuild — 2026-08-11

### Product

- Added Daily Command around `STATE → PRIORITY → ACTION → WORLD` with transparent readiness, `WHY THIS`, one Next Best Action and honest reduce/replace/defer/skip alternatives.
- Added local personalization for primary goal, realistic available time and enabled modules; strong low-recovery signals remain higher priority than declared intent.
- Made Return Protocol a dated, idempotent daily event with 3 / 10 / 25 minute scales; weekly returns are separated from lifetime returns and ordinary completions.
- Added decision-oriented Progress with real elapsed weekly windows, completed/adapted/return/workout/sleep history, confidence boundaries and real world traces.
- Weekly Review now excludes return events from normal completions, counts only current-week returns and receives the personalized next focus.

### Training

- Converted Training from a catalogue-like surface into an editable workout product with functional Full Body / Upper / Lower / Push / Pull / Legs / Mobility / Recovery / Custom starting structures.
- Added sets/reps/rest/notes, reordering, one-handed session mode, load/reps/RIR logging, previous performance, rest timer and session notes.
- Added favourites and exercise detail surfaces with technique, safety, alternatives and recent performance.
- Added corruption-safe normalization for the separate local Training store and tests for template/session/storage behaviour.
- Completed structured workouts bridge back into canonical GameState so progression, Weekly Review and narrative-readable flags react to real training.

### Recovery and personalization

- Replaced cumulative recovery bonuses with idempotent one-record-per-day sleep upserts and direct subjective energy check-ins.
- Recovery now explains sleep duration/quality, current energy and prior-day workload context without exposing a fabricated validated score.
- Prevented empty module profiles; corrupted or empty selections normalize back to a safe usable profile.
- Disabled recommendation modules now fall back only to modules the user actually enabled.

### UX and architecture

- Established four primary destinations: Today, Progress, Training and Recovery; mobile uses a safe-area-aware four-item bottom navigation.
- Added domain modules for recommendation, profile constraints, recovery, return, weekly review, progress and training rather than placing new business rules in JSX.
- Preserved canonical GameState schema 6 and existing v3/v4/v5 migrations; personalization and structured Training remain separate local schema-v1 stores in this slice.
- Added campaign-safe standalone save loading so premium routes do not race season content initialization.

### PWA, build and CI

- Made the Web manifest deployment-neutral with relative `id`, `start_url`, `scope` and asset URLs rather than hardcoding `/recode/`.
- Corrected GitHub Pages build working directory/Node version and made source validation aware of base-path runtime content loading.
- Made Sites build and artifact validation wrappers independent of executable file-mode preservation by invoking nested shell scripts through `bash`.
- Added/expanded domain tests for recommendations, profile fallback, Return, Weekly Review, Recovery, Training and Progress.
- Production rendered-HTML smoke now tests the configured GitHub Pages base path instead of assuming root hosting.

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
- Increased save soak to 500 cycles and added 500 malformed/future/Unicode fuzz cases.
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
# 2026-08-12 — Canonical premium rebuild

- Merged the current full-product source with Source A/B audit and provenance records.
- Added Source B Meridian Noir 2.0 V10 hero, origin and city visuals without removing V6/V7 responsive/supporting art.
- Updated the `/recode` service-worker shell cache for V10 assets and canonical update versioning.
- Added a five-destination mobile navigation with a More menu instead of an 11-item bottom bar.
- Added content integrity tests covering the complete narrative, quest, event, exercise and character counts.
