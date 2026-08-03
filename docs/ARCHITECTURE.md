# Architecture

## Dependency rule

UI depends on application services; services depend on state and data contracts; providers implement interfaces at the edge. Domain code never imports platform SDK classes.

| Layer | Responsibilities | Must not |
|---|---|---|
| Presentation | render, focus, input, accessible announcements | calculate rewards, call SDK directly |
| Application | use cases and validation | own secrets, render UI |
| Domain state | invariants and transitions | perform network/file UI |
| Content | immutable authored data | contain executable code |
| Providers | platform/network adaptation | decide game balance |
| Persistence | serialization, migration, backup | silently enable sync |

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
| Player progress offline | local save |
| Consent | local device, never remote-enabled |
| Purchase entitlement | verified store receipt |
| Community state | backend |
| Raw health record | platform health store |
| Journal | local-only |
| Remote balance | signed config within embedded bounds |

## Failure containment

Every optional subsystem has four states: disabled, initializing, ready, degraded. Degraded health returns manual input; degraded cloud leaves local save authoritative; degraded AI returns curated deterministic text; degraded analytics drops events; degraded purchase retains previous entitlement.

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
