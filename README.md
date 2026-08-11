# MARKOVMADE: RECODE — Personal Progress OS inside a Life RPG

**Понять состояние → выбрать следующий полезный шаг → сделать его в реальности → увидеть, как мир отвечает.**

Original concept, system and authorship: **Павел Марков / Pavel Markov / MARKOVMADE**.

Version **7.0.0** is an offline-first bilingual Life RPG source package. The product loop is `CHOICE → ACTION → WORLD`, expanded in the premium product layer into:

`STATE → PRIORITY → CHOICE → ACTION → PROOF → WORLD RESPONSE → ADAPTATION → REVIEW`.

RECODE is not a medical service, does not call deterministic rules “AI”, and does not punish missed days by deleting progress.

## Core product workspaces

The Web product now uses four primary destinations instead of treating every module as equally important:

- **Today / Daily Command** — current state, one priority, readiness, `WHY THIS`, one Next Best Action and honest alternatives;
- **Progress** — decision-oriented four-week trajectory, returns, workouts, sleep observations and real world traces;
- **Training** — editable workout templates, builder, one-handed session flow, previous performance, load/reps/RIR, rest timer, notes, favourites and exercise details;
- **Recovery** — bedtime/wake duration, subjective sleep quality and energy, explainable factors and conservative load adaptation.

`/setup/` is a system surface for primary goal, realistic available time and enabled modules. Disabled modules are not silently pushed back into Daily Command.

## Product rules

### Transparent recommendation engine

`web_app/app/domain/recommendation.ts` derives a baseline priority from observable local state. `profile.ts` applies user intent, time and enabled-module constraints without overriding a strong low-recovery signal. Sparse history is labelled as baseline confidence; no fake precision is generated.

### Return instead of punishment

After an absence, Return Protocol offers 3 / 10 / 25 minute scales. A return is idempotent for the current day, preserved as a dated record and available to narrative flags. Lifetime returns and weekly returns are kept conceptually separate.

### Recovery without a magic score

Recovery uses recorded sleep duration, subjective quality, current subjective energy and prior-day workload context. Re-editing the current day upserts the sleep record rather than duplicating history or repeatedly inflating stats.

### Progress without decorative analytics

Progress only shows metrics that can change a decision. With insufficient history it says so. Observed sleep/action relationships remain observations, not causal claims.

## Training product

Training is no longer only an exercise catalogue:

- Full Body / Upper / Lower / Push / Pull / Legs / Mobility / Recovery / Custom starting structures;
- template structures are editable starting points, not scientific prescriptions;
- exercise add/remove/reorder;
- sets, reps, rest, notes, load and RIR;
- previous-result display;
- rest timer and mobile session mode;
- favourites, technique, safety text, alternatives and recent performance;
- structured local history with corruption-safe normalization and backup;
- completed workouts bridge back into canonical GameState so Weekly Review, progression and story-readable flags can react.

The 1,324-exercise dataset is loaded by the Training feature rather than the initial product screen.

## Save and privacy boundary

Canonical Life RPG progress remains **GameState schema 6** with the existing v3/v4/v5 → v6 migration path and atomic primary/backup storage.

Structured Training and personalization intentionally use separate local schema-v1 stores in this rebuild slice. This avoids a destructive GameState migration while preserving existing saves.

Sensitive data remains local-first by default. Optional cloud sync retains an explicit privacy allowlist and consent boundary.

## Verified repository scope

- 14 chapters, 140 reachable scenes, 420 choices, 70 delayed consequences and 8 endings;
- 275 quests, 160 events, 1,324 exercises and 8 key characters;
- save schema 6 with v3/v4/v5 migration, backup, 1,000-cycle serialization/migration testing and malformed-input fuzzing;
- transparent recommendation, recovery, return, weekly-review, progress and training domain tests;
- Web/PWA source, optional owner-hosted cloud API, Creator Studio and Godot source;
- canonical version validation, SBOM/provenance generation and release packaging scripts;
- explicit owner-gate package for signing, devices, stores and independent reviews.

## Web architecture

```text
web_app/app/
  command/                 Daily Command presentation
  progress/                Progress presentation
  training/                Training builder/session presentation
  recovery/                Recovery presentation
  setup/                   Personal protocol settings
  domain/
    recommendation.ts
    profile.ts
    recovery.ts
    return-protocol.ts
    weekly-review.ts
    progress.ts
    training.ts
  infrastructure/
    save-storage.ts
    profile-storage.ts
    training-storage.ts
    training-game-bridge.ts
  design-system/
```

The legacy `app/page.tsx` remains the existing season/product shell and still contains several original modules. New business rules are intentionally outside JSX so that decomposition can continue incrementally without a high-risk rewrite of the narrative product.

## Clean-machine verification

```bash
bash scripts/bootstrap.sh
bash scripts/verify_all.sh
bash scripts/package_release.sh
```

The source-only gates can be run without native runtimes:

```bash
bash scripts/verify_source.sh
```

Web CI executes locked dependency install, source/content validators, backend integration, TypeScript typecheck, ESLint, production build, all Web unit/domain tests and final artifact validation.

## GitHub Pages / portable PWA

The Pages workflow builds from `web_app`, uses Node 22 and validates before upload. Next.js derives the GitHub Pages `basePath` from the repository name. The PWA manifest itself uses relative scope/start/icon URLs so the same artifact contract is not permanently hardcoded to `/recode/` and can also work under a root/custom deployment.

Build and artifact wrapper scripts explicitly invoke nested shell scripts through `bash`, so verification does not depend on executable file-mode preservation in archives or connector-based Git writes.

## Current truth boundary

The included CI/source evidence proves source/content contracts, backend integration, TypeScript, lint gates, production Web build, rendered production metadata smoke, save migration/fuzz tests, domain tests and packaged worker/hosting-manifest validation.

It does **not** prove physical-device behaviour, native signed exports, full browser E2E, Lighthouse/Core Web Vitals, assistive-technology conformance, external pentest, legal/clinical approval or store acceptance. See `docs/KNOWN_LIMITATIONS.md`.

## Deployment

For the prepared GitHub/Cloudflare deployment flow, start with [`START_HERE_GITHUB_DEPLOY.md`](START_HERE_GITHUB_DEPLOY.md). The Web/PWA remains local-first without the optional cloud backend.
