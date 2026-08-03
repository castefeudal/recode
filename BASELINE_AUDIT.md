# Baseline audit — 4.0.0 → 5.0.0

Date: 2026-07-29

## Chain of custody

- Input: `MARKOVMADE_RECODE_4.0.0_SOURCE.zip`
- Expected SHA-256:
  `21beeded072de25feb2c64dcf79036b7271688a1943550d5bc255259bdc73b13`
- Actual SHA-256: exact match — **PASS**
- Input archive remained unchanged; work occurred in a new 5.0.0 directory.
- Existing Sites identity reused; no second project created.

## Environment

| Tool | Result |
|---|---|
| Linux | available |
| Python | 3.12.13 |
| Node | 24.14.0 |
| npm | 11.9.0 |
| Browser | cloud Chrome agent preview available |
| Godot | unavailable |
| Docker | unavailable |
| Chrome/Lighthouse CLI | unavailable |

## Pre-change baseline

| Gate | Result |
|---|---|
| `bash scripts/test.sh` | 64/64 content PASS; backend integration initially SKIPPED until venv install; Godot SKIPPED |
| `npm run lint` | PASS |
| `npm test` | 4/4 PASS |
| `npm run validate:artifact` | PASS |
| backend contract + Uvicorn integration | 2/2 PASS after isolated venv install |
| Visual landing agent preview | PASS; initial delayed content loading observed, then ready |

## Baseline counts independently confirmed

14 chapters, 140 scenes, 420 choices, 70 delayed consequences, 30 branch
nodes, 20 closures, 89 variants, 8 endings × 4 acts, 275 quests, 160 events,
1 324 exercises and 8 characters.

## Baseline defects selected for 5.0.0

- save evidence only 50 cycles; no v4→v5/fuzz/future-schema gate;
- 56 balance runs covered only 7 profiles and 30/90 days;
- 4 structural narrative openings repeated 14 times; 22 short-copy warnings;
- no browser Creator edit/autosave roundtrip;
- onboarding consent was a CTA, not an explicit unchecked control;
- no skip link, persistent live region or online/offline state;
- backend had no oversized-body or simultaneous optimistic-write proof;
- Godot save wrote directly to primary rather than pending→rename.

Original baseline logs are retained under `docs/qa/baseline/`.
