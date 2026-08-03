# Visual QA report — 7.0.0

## Result

**PASS for production Web viewport; CONDITIONAL for full device matrix.**

- Desktop hero inspected at 2400×1500: subject stays right; headline and proof
  retain dark negative space; no baked text or visible anatomy defect.
- Mobile hero inspected at 1086×1448: subject remains readable in the lower
  right and safe copy area remains in the upper/left field.
- Cast inspected at 1586×992: exactly five distinct adults, crop-safe central
  faces, coherent Meridian lighting.
- Live desktop browser: landing hierarchy, product proof, CTA, stats,
  onboarding and game shell showed no overlap or clipped primary control.
- Runtime uses `<picture>` with AVIF→WebP→PNG fallback. Budget test passed:
  AVIF 33–56 KB, WebP 85–127 KB.

## Design rationale

The key art is subordinate to product proof: it supplies the emotional world
while text and interaction explain what the player actually does. Obsidian,
platinum, muted gold and restrained teal remain continuous from landing through
onboarding and the game shell.

## External matrix

Still required before a universal visual claim: 320, 360, 390, 768, 1024,
1440 and 1920 CSS px; iOS Safari; Android Chrome; Windows scaling 125/150%;
browser zoom 200/400%; reduced motion; HDR/non-HDR and forced-colors.
