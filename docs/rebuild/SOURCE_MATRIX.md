# Canonical rebuild — source decision matrix

| Subsystem | Source A / 7.0 | Source B / 10.0 | Current GitHub main | Final decision |
|---|---|---|---|---|
| Narrative campaign | Full game-side and web campaign; 14 chapters / 140 scenes / 420 choices / 70 delayed consequences / 8 endings | Same web campaign payload | Full payload plus v6 runtime migration | Keep current main and verify against A/B counts |
| Origins/classes | 4 origins, 5 classes, stats and gates | 4 onboarding origins and visual selector | Same origin runtime model | Keep game data and current runtime; add V10 visual identity |
| Quests/events | Full 275 / 160 datasets | Full web copies | Full lazy feature loaders and state effects | Keep current loaders and datasets |
| Exercises | Full 1,324 catalog, instructions and safety fields | Full 1,324 web copy | Full catalog, search/filter/favourites/history and training bridge | Keep current feature implementation; validate lazy loading |
| Characters/relations | 8 characters and narrative bible | 8 portraits and relationship presentation | 8 portraits plus state-backed relationship screen | Keep current relationship system and portraits |
| Web shell | Full legacy game shell | Premium landing/onboarding and rail direction | Shell + design system + product features + save/recovery UI | Keep current architecture; selectively port V10 art/copy |
| Design system | Art bible and tokens | Meridian Noir 2.0 visual direction, responsive CSS, typed Lucide icons | Central tokens, typed SVG icons, themes, motion and component CSS | Keep current system; align accent/art usage with B |
| Static export | GitHub Pages Next export and base path | Verified `next build`, `/recode` base path, PWA workflow | Next static export with current CI and Pages workflow | Keep current workflow; verify asset paths and artifact |
| PWA/offline | Source/game support docs | Relative-scope SW and cache versioning | Base-path-aware SW with update activation and content cache | Keep current SW; update cache manifest for V10 assets |
| Saves | Schema/migration/source support | Web v6 save implementation | v3/v4/v5 → v6, atomic primary/backup and import/export | Keep current save infrastructure; test round trips |
| Backend/native | Complete backend/native/Godot source | Not included | Complete backend/native/Godot plus later security/evidence docs | Keep source; do not couple it to Pages initial runtime |
| Audio | Music + SFX source assets and bible | No runtime audio | Audio remains source-only | Document deferred opt-in; no autoplay or sensory regression |
| Legal/provenance | Complete legal and notices | README/deploy docs | Legal and provenance retained | Keep and update rebuild documentation |

