# Design System

## Source structure

```text
web_app/app/design-system/
├── tokens.css
├── base.css
├── legacy.css
├── visual-upgrade.css
├── Icon.tsx
└── components.tsx
```

The import order in `app/globals.css` is deliberate: tokens → foundations → compatibility layer → final visual layer.

## Semantic foundations

`tokens.css` defines:

- dark, light and high-contrast themes;
- canvas, three surface levels, interactive and raised surfaces;
- primary, secondary, tertiary and disabled text;
- border hierarchy;
- accent, focus, success, warning, danger, information, narrative, relationship and progress colours;
- responsive typography using `clamp()`;
- spacing, containers, gutters and safe-area-compatible layout values;
- radii, borders, shadows and blur;
- motion durations/easings;
- z-index layers.

The previous runtime variable names remain aliases so the visual upgrade does not break existing screens while components are progressively migrated.

## Themes

- **Dark:** primary production direction; graphite rather than pure black.
- **Light:** warm mineral/paper hierarchy, not a mechanical inversion.
- **High contrast:** explicit stronger surfaces, borders, text and focus indicators.
- The selected light/dark preference is persisted locally and applied to the root element before screen composition.

## Typography

- Display: condensed system fallback stack with Cyrillic support.
- Body: Inter/Noto/Segoe/system fallback stack.
- Editorial: Georgia/Times fallback for story dialogue.
- Data: IBM Plex Mono/DM Mono/system mono fallback.
- No font binary was added, avoiding an unverified licence or network dependency.

## Responsive model

Explicit treatments exist at approximately 1184, 960, 760 and 368 CSS pixels, plus short landscape handling. The minimum supported canvas is 320 px. Mobile uses a persistent safe-area-aware bottom navigation and condensed top bar.

## Accessibility foundations

- 44 px minimum target foundation for interactive controls.
- Visible `:focus-visible` ring.
- Skip links and live regions.
- Reduced motion.
- System high-contrast preference support.
- Semantic progress, tab, switch, dialog and status APIs in primitives.
- Dialog focus entry, focus trap, Escape close and focus restoration.

## Compatibility policy

`legacy.css` remains a frozen compatibility layer. New visual decisions must go into tokens, base or the final visual layer. New component work must not add arbitrary colours or duplicate semantic states.
