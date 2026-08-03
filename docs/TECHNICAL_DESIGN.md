# Technical Design

## Runtime topology

RECODE состоит из независимых контуров:

1. Godot client — канонический offline runtime.
2. Web/PWA vertical — основной полностью проходимый offline-first продукт.
3. Optional backend — sync, community, receipts, moderation, remote config.
4. Content tools — deterministic generator, Creator Studio, validators.
5. Native adapters — HealthKit, Health Connect, notifications, purchases, Steam.

Отсутствие любого online/native контура не блокирует новый профиль, первый сезон, ручные действия, local save и финал.

## Boot sequence

1. Load design tokens and localization.
2. Initialize local save directory.
3. Parse content manifests and schema versions.
4. Start providers with `disabled` defaults.
5. Read consent; initialize только разрешённые providers.
6. Load primary save; при ошибке — backup.
7. Validate referenced scene; при orphan — chapter first scene.
8. Render onboarding или dashboard.
9. Запустить deferred sync после первого usable frame.

Boot budget: 2.5 s на reference mobile после холодного старта; network timeout не входит в critical path.

## Domain state

`AppState` — единственный mutable aggregate игрового прогресса. Он содержит profile, stats, resources, graph cursor, flags, relationships, quest state, room levels, choice history, delayed queue, consent и return count.

Write flow:

`UI intent → service validation → AppState transition → state signal → atomic save → optional analytics`

UI не меняет словарь напрямую. External providers возвращают нормализованное observation, которое проходит duplicate/cap checks до эффекта.

## Narrative transaction

`select_choice` выполняет:

1. resolve stable choice ID;
2. reject missing choice;
3. validate condition and cost;
4. atomically pay cost;
5. apply immediate effects;
6. append choice history;
7. schedule delayed consequence by copied payload;
8. advance graph cursor;
9. resolve due queue;
10. persist;
11. return next scene or typed error.

Повторный tap должен быть идемпотентным на UI-уровне: кнопки disabled после первого accepted intent. На уровне save duplicate choice in same scene отклоняется.

## Content schema v4

Required scene fields:

- `id`, `chapter_id`, `order`;
- `beat`, `location`, `speaker`;
- localized `text`;
- `choices`, `next_default`;
- `content_warnings`;
- accessibility contract;
- analytics funnel/step.

Required choice fields:

- stable ID and source scene;
- localized text;
- intent;
- immediate effects;
- optional delayed ID;
- next scene;
- cost;
- localized telegraph.

Generator — source of reviewed blueprints, JSON — runtime artifact. Если JSON редактировался вручную, изменения должны быть возвращены в generator, иначе следующая сборка их сотрёт.

## Save format

Path: `user://recode_save.json`; backup: `user://recode_save.backup.json`.

Rules:

- UTF-8 JSON, schema version at root;
- backup existing primary before replacement;
- unknown fields preserved by migrations when possible;
- missing v2 fields receive safe defaults;
- future schema version must not be silently loaded;
- settings/consent split from cloud payload when cloud включён;
- journal content never enters shared progress save.

Production hardening: write temporary file, flush/fsync, checksum, atomic rename. Текущий baseline использует primary+backup и должен получить atomic replace перед store release.

## Sync contract

Cloud sync is opt-in. Payload categories:

- monotonic: achievements, completed quests, choice history;
- max-like: room levels;
- cursor: scene/chapter, requires causal version;
- bounded numeric: stats/resources, server validates delta;
- private local-only: journal, raw health samples.

Conflict policy:

- same device revision → accept newer;
- divergent story cursor → retain both snapshots and ask user;
- monotonic sets → union;
- purchases → server receipt source of truth;
- consent → never enabled remotely.

## Health normalization

Provider output:

```json
{
  "source": "manual|healthkit|health_connect",
  "type": "steps|sleep|workout",
  "start_utc": "...",
  "end_utc": "...",
  "value": 0,
  "unit": "...",
  "source_record_id_hash": "...",
  "confidence": "user|device"
}
```

Raw records stay on device unless separate explicit upload purpose exists. Duplicate key: provider + hashed record ID + interval. Daily reward caps are in balance data, not provider code.

## Backend

FastAPI boundary exposes health check and prepared domain endpoints. Production requirements:

- PostgreSQL migrations;
- short-lived access token + rotating refresh token;
- per-device/session revocation;
- idempotency key for writes;
- rate limit by account/device/IP bucket;
- structured audit log without private content;
- receipt verification server-to-server;
- deletion/export jobs with visible status;
- encryption at rest managed by cloud KMS.

Backend failure behavior: queue only sync-safe operations, exponential backoff with jitter, maximum queue size, visible status, no blocking modal.

## Security threats

| Threat | Control |
|---|---|
| Save editing | accept for offline single-player; server validates community/receipt claims |
| Replay purchase | transaction ID uniqueness + store verification |
| Token theft | OS secure storage, rotation, revoke |
| Health overcollection | data minimization, local aggregation, purpose-specific consent |
| Remote config abuse | signed config, allowlist, safe defaults, kill switch |
| Creator campaign injection | JSON Schema, escaped rendering, no executable script |
| Analytics leakage | typed event schema, free-text fields prohibited |

## Performance budgets

Mobile:

- 60 fps UI target, 30 fps minimum low tier;
- frame CPU ≤ 12 ms typical;
- hero image ≤ 1.2 MB compressed delivery;
- loaded portrait working set ≤ 64 MB;
- save ≤ 250 KB;
- no network on render thread.

Desktop:

- 1080p/1440p/4K scalable UI;
- controller focus response < 100 ms;
- cold load < 2 s SSD after import;
- Steam Deck 40/60 fps profiles.

## Accessibility implementation

Focus graph is explicit for every modal. Dynamic updates announce short semantic summaries, not raw numbers. Reduced motion disables parallax/large transitions. Soft theme changes both foreground and background contrast; it is not just a warm filter. Text scale is tested at 200%.

## Error taxonomy

- `CONTENT_MISSING`: fallback scene + diagnostic ID.
- `SAVE_CORRUPT`: try backup, preserve corrupt file for support.
- `INSUFFICIENT_RESOURCE`: return typed non-fatal result.
- `PROVIDER_DENIED`: manual mode remains available.
- `SYNC_CONFLICT`: retain both versions.
- `RECEIPT_PENDING`: entitlement remains previous known-good state.
- `CONFIG_INVALID`: ignore remote config and use embedded defaults.

User-facing messages never expose stack traces or internal paths.

## Build reproducibility

- pinned engine version in `project.godot`/docs;
- `npm ci`, not floating install;
- Python requirements pinned before release;
- deterministic content generator;
- checksums for archive;
- clean checkout build in CI;
- source commit recorded in manifest;
- signed artifacts never overwritten in place.
