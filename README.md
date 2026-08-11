# MARKOVMADE: RECODE — Life RPG

**Перепиши тело. Перепиши решения. Перепиши жизнь.**

Original concept, system and authorship: **Павел Марков / Pavel Markov / MARKOVMADE**.

Version **7.0.0** is an offline-first bilingual Life RPG source package. The product loop is `CHOICE → ACTION → WORLD`: a narrative decision proposes a bounded real action, and completion changes Meridian, relationships and subsequent context. It is not a medical service and does not punish missed days by deleting progress.

## Premium rebuild workspaces

The current rebuild branch adds product surfaces around the same Life RPG state instead of replacing the narrative system:

- `/command/` — Daily Command Center: state → priority → next action → world response → weekly review;
- `/setup/` — local personalization profile for goal, realistic available time and enabled modules;
- `/training/` — structured workout builder/session mode with load, reps, RIR, rest timer, previous result and local history;
- `/recovery/` — explainable sleep/recovery context that writes back to the same local GameState and adapts Daily Command;
- Return Protocol — 3 / 10 / 25 minute non-punitive re-entry after time away;
- structured workout completion is bridged back into `GameState` so story flags, progression and Weekly Review can react to real training.

Personalization and structured training use separate local v1 stores in this phase. This intentionally avoids a destructive GameState schema bump while the existing schema-6 migration path remains stable. Sensitive journal, food, sleep and private-data boundaries remain local-first.

## Verified repository scope

- 14 chapters, 140 reachable scenes, 420 choices, 70 delayed consequences and 8 endings;
- 275 quests, 160 events, 1,324 exercises and 8 key characters;
- save schema 6 with v3/v4/v5 migration, backup and malformed-input tests;
- Web/PWA source, optional owner-hosted cloud API, Creator Studio and Godot source;
- canonical version validation, SBOM/provenance generation and release packaging scripts;
- explicit owner-gate package for signing, devices, stores and independent reviews.

## Clean-machine flow

```bash
bash scripts/bootstrap.sh
bash scripts/verify_all.sh
bash scripts/package_release.sh
```

`bootstrap.sh` installs locked Web and backend dependencies. `verify_all.sh` is strict: missing dependencies or Godot are failures, not skipped passes. The source-only gates can be run without those runtimes:

```bash
bash scripts/verify_source.sh
```

## Architecture

- `web_app/app/game.ts` — canonical Life RPG state, narrative rules and migrations;
- `web_app/app/domain/` — recommendation, recovery, return, weekly-review, training and personalization rules kept outside JSX;
- `web_app/app/infrastructure/` — save, profile, training and cloud adapters;
- `web_app/app/command/` — Daily Command Center presentation;
- `web_app/app/training/` — structured workout builder/session presentation;
- `web_app/app/recovery/` — recovery capture and explanation presentation;
- `web_app/app/components/CloudPanel.tsx` — cloud presentation boundary;
- `backend/app/main.py` — optional cloud API with production guard and session lifecycle;
- `game/` — Godot source and platform capability adapters;
- `tools/validators/` — content, architecture, native and release gates;
- `evidence/` — raw baseline/final machine outputs;
- `owner_gates/` — external evidence procedures.

The legacy `web_app/app/page.tsx` still contains several original screen modules. The rebuild deliberately migrates high-value flows behind domain boundaries first instead of performing a high-risk big-bang rewrite of the 140-scene product.

## Current truth boundary

The included execution proves only the gates that have actually run successfully. A source-level implementation is not equivalent to a proven production release. Production Web build, browser E2E, Lighthouse/Web Vitals, signed native binaries, physical-device integration, external pentest, legal/clinical approval, human accessibility study and store acceptance require their own evidence before those claims can be made.

## GitHub + Web deployment

For the prepared GitHub/Cloudflare deployment flow, start with [`START_HERE_GITHUB_DEPLOY.md`](START_HERE_GITHUB_DEPLOY.md). The Web/PWA runs local-first without the optional cloud backend. The rebuild also corrects the GitHub Pages workflow to run from `web_app`, use the package-required Node 22 runtime and gate deployment on Web/source verification.
