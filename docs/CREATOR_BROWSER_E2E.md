# Creator Studio browser E2E — 7.0.0

Date: 2026-07-29

| Step | Result |
|---|---|
| Open production-served `/creator-studio/` | PASS |
| Edit RU/EN campaign titles | PASS |
| Edit RU/EN prose, dialogue and two choices | PASS |
| Live preview reflects prose/choices | PASS |
| Duplicate scene with generated unique ID | PASS |
| Undo then redo duplicate | PASS |
| Orphan validator turns red after duplicate | PASS |
| Remove orphan; all nine checks green | PASS |
| Metadata autosave and reload restoration | PASS after fix |
| Import fixture with browser file chooser | SKIPPED — cloud browser permission denied |
| Download-event capture for `.mmc` | SKIPPED — event unavailable |
| Canonical JSON roundtrip | PASS — Python test |
| Duplicate/orphan/unsafe-path/XSS rejection | PASS — Python test |

The browser revealed a real autosave weakness: title metadata relied on a
change/blur sequence. Version 5 uses immediate input autosave. A subsequent
reload visibly restored `Точка А — AUTOSAVE`.

The upload denial was not bypassed. Full file chooser import/export remains an
owner browser gate; static parsing alone is not represented as complete E2E.
