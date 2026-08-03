# Visual upgrade evidence index

Assessment date: 2026-08-03

## Baseline

- `baseline/screenshots/` — six Chromium baseline renders produced from the original uploaded source styling.
- `baseline/screenshots/SHA256SUMS.txt` — hashes for baseline PNG evidence.

## Final visual evidence

- `screenshots/` — ten final Chromium renders covering landing, dashboard, story, component gallery, desktop/mobile and dark/light variants.
- `screenshots/SHA256SUMS.txt` — hashes for final PNG evidence.
- `preview-runtime/` — static visual evidence mirrors using the final authored CSS and production art assets.

The preview mirrors are evidence surfaces, not a substitute for the unavailable production React build.

## Automated visual/source evidence

- `layout-audit.json` — seven Chromium viewport cases; document overflow, touch target and accessible-name checks.
- `layout-audit-console.txt` — renderer console output.
- `final/visual-design-validator.json` — 11/11 visual design source gates.
- `final/css-audit.json` — CSS parser and authored-layer statistics.
- `final/typescript-transpile-check.json` — syntax/transpile check for 18 TypeScript/TSX files.
- `final/asset-audit.json` — image format, size, readability and duplicate audit.
- `final/verify-source-final.txt` — full source verification, exit code 0.
- `final/verify-all.txt` — strict full gate, exit code 69 because locked Web dependencies could not be installed.
- `final/npm-install-attempt.txt` — dependency installation attempt, exit code 22 because the configured locked tarball URL returned HTTP 404.

## Design documentation

See `docs/design/`:

- `VISUAL_DIRECTION.md`
- `DESIGN_SYSTEM.md`
- `COMPONENT_INVENTORY.md`
- `MOTION_SYSTEM.md`
- `ACCESSIBILITY_REPORT.md`
- `VISUAL_QA_REPORT.md`
- `ASSET_AUDIT.md`
- `ASSET_INVENTORY.csv`
- `BEFORE_AFTER.md`
- `KNOWN_LIMITATIONS.md`
