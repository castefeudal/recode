# Accessibility Report

## Implemented source-level controls

- Skip links for landing, onboarding and application content.
- Semantic landmarks and labelled primary navigation.
- `aria-current` on active application navigation.
- Live region for save/errors/toasts.
- Visible focus treatment with stronger system-contrast variant.
- 44 px interactive-control foundation and safe-area mobile navigation.
- Reduced-motion support at system and product level.
- High-contrast product preference.
- Labels for cloud fields and destructive actions.
- Semantic progress bars, tabs, switches, dialogs, alerts and status primitives.
- Dialog focus entry, Tab containment, Escape handling and focus restoration.
- Image alternative text for meaningful art; decorative scene backdrops are hidden.

## Automated evidence completed

- `design-system-contract.test.mjs`: focus, reduced motion, contrast preference, touch-target foundation, labels and semantic component APIs.
- Chromium static evidence layout audit: seven desktop/mobile cases, no document-level horizontal overflow and no unnamed interactive controls.

## Not claimed

A production runtime axe scan, screen-reader session and 200% zoom E2E were not executed because the locked Web dependency could not be installed from the available registry. WCAG 2.2 AA remains a target, not a certified result, until those owner gates are run on a successful production build.
