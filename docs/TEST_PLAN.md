# Test Plan

## Test pyramid

### Static/content

- JSON parse and schema;
- count and unique IDs;
- graph references and reachability;
- localization parity;
- asset counts and hotlink prohibition;
- content warning presence;
- no analytics free-text fields.

### Domain unit

- stat clamp 0–100;
- relationship clamp -10…10;
- resource never negative;
- cost rejection is atomic;
- delayed due-scene calculation;
- ending priority;
- origin reset;
- save v3→v4 migration/defaults and primary→backup recovery.

### Contract/integration

- backend health/auth/sync/receipt response shapes;
- offline fallback;
- provider denial;
- idempotency key replay;
- sync conflict retention;
- Creator Studio export→validator→runtime.

### End-to-end

- four onboarding origins;
- 14-chapter default path;
- eight ending fixtures;
- setback/return path;
- controller-only;
- mobile touch;
- save/load every chapter;
- corrupted primary → backup;
- deletion/export.

## Device matrix

| Tier | Representative | Key risk |
|---|---|---|
| Android low | 4 GB RAM, 720p | memory/import time |
| Android modern | 1080p, gesture nav | safe area/background |
| iPhone compact | SE class | text clipping |
| iPhone modern | notched | safe area |
| iPad | 4:3 | layout density |
| Windows | 1080p + 150% DPI | focus and scaling |
| Steam Deck | 1280×800 | controller/keyboard |
| macOS | Apple Silicon | signing/suspend |
| Web mobile | 390 px | bottom navigation |
| Web desktop | 1440 px | large composition |

## Narrative QA

For every scene:

- speaker/location/beat coherent;
- choice intentions distinct;
- next scene exists;
- effect matches wording;
- delayed echo recalls source;
- no accidental gender assumption;
- no diagnostic/medical claim;
- no moralized food/body copy;
- content warning where necessary;
- English preserves meaning, not word order.

## Accessibility QA

- keyboard reaches every control in visual order;
- focus visible against both themes;
- controller focus cannot escape modal;
- screen reader names icon-only actions;
- 200% text does not hide primary CTA;
- reduced motion produces no large transforms;
- no state by color only;
- subtitle/text alternative for audio;
- no timed decision without extension.

## Performance QA

- cold/warm startup;
- frame-time capture Today/Story/Gym;
- 1324 exercise search;
- memory before/after 50 scene transitions;
- background/foreground 20 cycles;
- 100 save writes;
- image decode peak;
- backend p95 and error budget.

## Security/privacy QA

- network capture before consent is empty except user-requested endpoint;
- health denial leaves manual route;
- journal never in network/analytics;
- token redacted from logs;
- remote config signature invalid → embedded defaults;
- malformed campaign rejected;
- deletion removes server-side records within documented SLA;
- export contains only user-owned data.

## Release severity

- P0: data loss, security/privacy breach, harmful guidance, cannot launch.
- P1: blocker in main story, purchase/entitlement failure, inaccessible core path.
- P2: degraded feature with workaround, important layout issue.
- P3: cosmetic/copy issue.

Release requires zero open P0/P1. P2 needs written acceptance, owner and target version.

## Exit report

Report includes build hashes, environment, passed/failed/skipped counts, exact skipped reason, known issues and recommendation. «Not run» must never be presented as «passed».
