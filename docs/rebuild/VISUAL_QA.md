# Visual QA — canonical rebuild

## Static checks executed

- V10 hero, origin sprite and Meridian city assets exist in the Pages export.
- Source design validator: 11/11 checks passed, including theme, focus, reduced motion, typed icons, responsive foundations and asset integrity.
- Production export generated from a clean `npm ci` dependency tree.

## Browser evidence

The local static server was prepared under `/recode/`, but the connected cloud browser rejected loopback navigation with `ERR_BLOCKED_BY_CLIENT`. Therefore local browser screenshots are **not** marked PASS.

After the final Pages build, the production browser verified the hydrated landing, onboarding, Today, Story, Body, Relations, Meridian and Profile states at `https://castefeudal.github.io/recode/`. The browser provider did not expose a filesystem path for exporting its JPEG screenshot bytes into the repository, so no repository screenshot file is claimed here.

## Required matrix after deployment

Landing, onboarding/origin, Today, Story, Body, Relations, Meridian and Profile at desktop and mobile widths; dark, light and high-contrast where available. Check 320px for horizontal overflow and 44px touch targets.

The full desktop/mobile screenshot matrix remains a follow-up limitation because the browser viewport API was restricted in this environment. This report does not invent a visual score.
