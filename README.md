# MARKOVMADE: RECODE — Life RPG

**Перепиши тело. Перепиши решения. Перепиши жизнь.**

Original concept, system and authorship: **Павел Марков / Pavel Markov / MARKOVMADE**.

Version **7.0.0** is an offline-first bilingual Life RPG source package. The product loop is `CHOICE → ACTION → WORLD`: a narrative decision proposes a bounded real action, and completion changes Meridian, relationships and subsequent context. It is not a medical service and does not punish missed days by deleting progress.

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

- `web_app/app/game.ts` — domain model and migrations;
- `web_app/app/infrastructure/` — storage and cloud adapters;
- `web_app/app/components/CloudPanel.tsx` — cloud presentation boundary;
- `backend/app/main.py` — optional cloud API with production guard and session lifecycle;
- `game/` — Godot source and platform capability adapters;
- `tools/validators/` — content, architecture, native and release gates;
- `evidence/` — raw baseline/final machine outputs;
- `owner_gates/` — external evidence procedures.

## Current truth boundary

The included execution proves the source/content gates listed in `TEST_REPORT.md`. It does not prove a production Web build, signed native binary, physical-device integration, external pentest, legal/clinical approval, human accessibility study or store acceptance. Consequently the package is not labelled 10/10 until those mandatory rows have evidence.

## GitHub + Web deployment

For the prepared GitHub/Cloudflare deployment flow, start with [`START_HERE_GITHUB_DEPLOY.md`](START_HERE_GITHUB_DEPLOY.md). The Web/PWA runs local-first without the optional cloud backend.
