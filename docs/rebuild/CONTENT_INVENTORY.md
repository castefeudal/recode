# Canonical rebuild — content inventory

## Verified counts

Counts were computed from parsed JSON payloads on 2026-08-12, not copied from release notes.

| Content | Count |
|---|---:|
| Origins | 4 |
| Classes | 5 |
| Chapters | 14 |
| Scenes | 140 |
| Choices | 420 |
| Delayed consequences | 70 |
| Ending rules | 8 |
| Quests | 275 |
| Events | 160 |
| Exercises | 1,324 |
| Characters | 8 |
| Achievements | 20 |
| Rooms / spaces | 10 |

## Integrity rules

- Web and game narrative copies are compared by object IDs and counts.
- Quests, events, exercises and characters are loaded from static JSON; exercise catalog loading is feature-local rather than initial-bundle content.
- A content-load failure produces an empty/error state in the feature instead of silently substituting a sample dataset.
- Narrative choices preserve requirements, costs, route effects, delayed consequence IDs, telegraphs, variants and origin/relationship gates.
- Content source provenance is retained in `docs/PROVENANCE.json`, `ASSET_LICENSES.md` and the rebuild matrix.

## Dataset locations

- Game source: `game/narrative/season_01.json`, `game/data/*.json`.
- Web source: `web_app/content/season_01.json` and `web_app/public/content/*.json`.
- Creator Studio schema: `web_app/public/creator-studio/campaign.schema.json`.

