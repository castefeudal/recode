# Architecture

## Dependency rule

UI depends on application/domain services; services depend on state and data contracts; providers implement interfaces at the edge. Domain code never imports platform SDK classes.

| Layer | Responsibilities | Must not |
|---|---|---|
| Presentation | render, focus, input, accessible announcements | calculate rewards, call SDK directly |
| Application/domain | use cases, recommendation rules, validation, derived observations | own secrets, render UI |
| Domain state | invariants and transitions | perform network/file UI |
| Content | immutable authored data | contain executable code |
| Providers | platform/network adaptation | decide game balance |
| Persistence | serialization, migration, backup | silently enable sync |

## Web product architecture

The premium Web slice is intentionally additive to the existing season shell. It moves high-value product rules out of `app/page.tsx` without rewriting the 140-scene product in one risky migration.

```text
web_app/app/
  command/                 Today / Daily Command presentation
  progress/                Decision-oriented Progress presentation
  training/                Workout builder + session presentation
  recovery/                Recovery observation/check-in presentation
  setup/                   Personal protocol configuration
  domain/
    recommendation.ts      transparent baseline recommendation rules
    profile.ts             goal/time/module constraints and safe fallback
    recovery.ts            sleep/load observations and idempotent sleep upsert
    return-protocol.ts      non-punitive dated return event
    weekly-review.ts       current-week review and observation boundaries
    progress.ts            elapsed weekly windows and decision-oriented history
    training.ts            workout templates, session records, normalization
  infrastructure/
    save-storage.ts        canonical GameState primary/backup + migration entry
    profile-storage.ts     separate local profile schema v1
    training-storage.ts    separate local Training schema v1 + backup
    training-game-bridge.ts completed workout → canonical GameState trace
  design-system/           semantic tokens and workspace-specific responsive CSS
```

### Primary information architecture

Core Web navigation intentionally exposes four main destinations:

1. **Today** — state → priority → one action → world response.
2. **Progress** — recent trajectory and the decision it supports.
3. **Training** — build and execute real workouts.
4. **Recovery** — record and explain recovery context.

`Setup` is a system/configuration surface rather than a fifth daily destination. The existing narrative/world screens remain in the legacy season shell and can be decomposed incrementally.

### Recommendation dependency order

Recommendation follows an explicit precedence rather than an opaque score:

1. strong current recovery constraint;
2. weakest observed domain from canonical local state;
3. selected goal as a sparse-history tie-breaker;
4. enabled-module constraints;
5. realistic available-time cap.

A disabled module is never silently reintroduced as a fallback. Low recovery is not overridden merely because the user declared a different goal.

### Recovery semantics

Recovery is an observation layer, not a validated medical readiness algorithm. It uses:

- bedtime/wake-derived duration;
- subjective sleep quality;
- subjective current energy;
- prior-day recorded workout/action context.

There is one sleep record per in-product day. Editing the same day upserts that record rather than accumulating bonuses or duplicate observations.

### Return semantics

Return Protocol is a first-class dated event. A return can be completed once per in-product day, increments lifetime returns once, creates a daily return record, writes story-readable flags and preserves the existing progress trajectory. Weekly Review derives weekly returns from dated records instead of exposing the lifetime counter as a weekly metric.

### Training ownership

Structured Training remains in a separate local schema-v1 store during this slice so canonical GameState schema 6 and its v3/v4/v5 migrations remain stable. Completion is bridged back into canonical state as a workout-history trace, progression change and story-readable flags. The bridge is one-way at completion; this avoids destructive conversion of legacy string workout history.

### Progress semantics

Progress derives elapsed weekly windows from real records. It deliberately avoids decorative charts and refuses a confident decision when history is insufficient. Observed associations remain labelled as observations; no causal effect is inferred from personal logs.

## Godot modules

- `autoload/AppState.gd`: aggregate state and transitions.
- `services/NarrativeService.gd`: graph transaction.
- `services/SaveService.gd`: persistence and migration.
- `services/HealthService.gd`: provider selection and normalized observations.
- `services/*`: bounded domain services, each with snapshot and signals.
- `providers/*`: manual/mock/native/cloud adapters.
- `data/`, `narrative/`, `localization/`: versioned content.

## Data ownership

| Data | Source of truth |
|---|---|
| Canonical season | bundled JSON |
| Player progress offline | canonical local GameState save |
| Personal protocol | separate local profile store |
| Structured workout drafts/sessions | separate local Training store |
| Consent | local device, never remote-enabled |
| Purchase entitlement | verified store receipt |
| Community state | backend |
| Raw health record | platform health store |
| Journal | local-only |
| Remote balance | signed config within embedded bounds |

## Persistence and compatibility

Canonical Web progress remains save schema 6. Existing v3/v4/v5 saves migrate through the established migration path; primary and backup copies remain authoritative for recovery from interrupted/corrupted writes.

New personalization and structured Training state deliberately do not force schema 7. Their local stores normalize malformed input and can evolve independently until a future migration has a product reason to join canonical GameState.

Standalone premium routes call campaign-safe save loading before migration so they do not race the canonical season content required by existing migration/new-game code.

## Failure containment

Every optional subsystem has explicit degraded behaviour. Degraded exercise-library loading leaves saved Training sessions/history usable and provides retry. Missing history produces baseline/insufficient conclusions instead of fabricated insights. Degraded cloud leaves local save authoritative. Degraded health returns manual input; analytics drops events; purchase retains previous entitlement.

## PWA and deployment paths

Next.js derives a GitHub Pages `basePath` from `GITHUB_REPOSITORY` during Actions builds. The PWA manifest uses relative `id`, `start_url`, `scope` and asset URLs so installability is not permanently bound to `/recode/` and remains portable to root/custom deployments.

Build/validation wrappers invoke nested shell scripts explicitly through `bash`; correctness therefore does not depend on executable file-mode preservation in archive, connector or checkout environments.

## Versioning

- App semantic version: `MAJOR.MINOR.PATCH`.
- Save schema integer, explicit migration per increment.
- Content schema integer.
- Campaign schema semver.
- API path version.
- Remote config includes minimum compatible client and expiry.

Breaking content IDs require migration map. Renaming a scene without a map is prohibited after release.

## Deployment environments

Development uses local data and mock providers. Staging uses isolated database/store sandbox and non-production analytics. Production uses signed config, production receipts and least-privilege credentials. A build cannot switch from staging to production only through remote config; environment is embedded and visible in diagnostics.

## Verification boundary

Current CI proves source/content validators, backend integration, TypeScript typecheck, ESLint error gate, production Web build, rendered metadata/base-path smoke, Web domain/unit tests, save migration/fuzz and packaged Worker/hosting-manifest validation.

Native export jobs are intentionally conditional on `workflow_dispatch`; a skipped native job is not treated as a pass. Browser E2E, Lighthouse/Core Web Vitals and human/assistive-technology accessibility validation remain separate evidence gates.
