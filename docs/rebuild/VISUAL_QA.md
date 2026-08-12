# Visual QA — canonical rebuild

## Static checks executed

- V10 hero, origin sprite and Meridian city assets exist in the Pages export.
- Source design validator: 11/11 checks passed, including theme, focus, reduced motion, typed icons, responsive foundations and asset integrity.
- Production export generated from a clean `npm ci` dependency tree.

## Browser evidence

The local static server was prepared under `/recode/`, but the connected cloud browser rejected loopback navigation with `ERR_BLOCKED_BY_CLIENT`. Therefore local browser screenshots are **not** marked PASS. Production browser screenshots are to be captured after the GitHub Pages deployment is available; no screenshot evidence is fabricated from CSS/source alone.

## Required matrix after deployment

Landing, onboarding/origin, Today, Story, Body, Relations, Meridian and Profile at desktop and mobile widths; dark, light and high-contrast where available. Check 320px for horizontal overflow and 44px touch targets.

