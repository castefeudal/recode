# Defect log — 7.0.0

| ID | Area | Severity | Finding | Resolution / owner |
|---|---|---:|---|---|
| R6-001 | Visual | P1 | Generic hero did not prove the product | FIXED: bespoke desktop/mobile hero + live core-loop proof |
| R6-002 | Save | P1 | v5 lacked journey state | FIXED: schema 6, Web/Godot journey and legacy inference |
| R6-003 | QA | P1 | 500 save/fuzz and 1,200 balance runs below target | FIXED: 1,000 + 1,000 + 5,040 |
| R6-004 | UX | P1 | World response was not visible in first session | FIXED: Today trajectory strip |
| R6-005 | PWA | P2 | Generic favicon/icons and weak update affordance | FIXED: brand assets, manifest, explicit update banner |
| R6-006 | Accessibility | P2 | No user high-contrast control | FIXED; AT matrix remains external |
| R6-007 | Security | P1 | Next 16.2.6 advisories | PARTIAL: updated to 16.2.12; 3 high audit groups remain upstream/open |
| R6-008 | Balance | P1 | One of 5,040 fixtures exceeded action concentration cap | FIXED: domain rotation; full rerun passed |
| R6-009 | Native | P1 | No Godot 4.6 executable in environment | OPEN / OWNER CI |
| R6-010 | Audio | P2 | Prototype audio is not final mastered production audio | OPEN / AUDIO OWNER |
| R6-011 | Human validation | P1 | No real participants or physical AT devices | OPEN / PRODUCT OWNER |
| R6-012 | Legal/store | P1 | No accountable professional clearance/signing credentials | OPEN / OWNER + COUNSEL |

No known P0 blocker exists for the deployed Web/PWA owner build. Open P1 items
block claims of a signed universal commercial release.
