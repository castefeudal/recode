# Asset Audit

## Result

- 25 visual asset files inspected.
- 15 WebP, 7 PNG and 3 AVIF files.
- 15,032,914 total bytes.
- 0 unreadable images.
- 0 exact duplicate hash groups.
- Existing licence declarations remain in `ASSET_LICENSES.md` and `THIRD_PARTY_NOTICES.md`.
- No external font or new unlicensed art binary was introduced by the visual upgrade.

Detailed dimensions, modes, file sizes and SHA-256 values are recorded in `ASSET_INVENTORY.csv`.

## Runtime rules

- Meaningful images retain descriptive alternative text.
- Decorative narrative backdrops use empty alternative text and `aria-hidden`.
- Existing AVIF/WebP variants are retained where available.
- Large imagery is framed with stable aspect/crop treatment rather than stretched.
- Responsive images and production preload behaviour still require confirmation in a successful compiled build.
