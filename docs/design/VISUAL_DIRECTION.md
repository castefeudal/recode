# MARKOVMADE: RECODE — Visual Direction

## Design thesis

**Cinematic industrial editorial design.** The interface treats real-life action as a consequential story event rather than a metric-entry chore. It combines a disciplined product shell, editorial scale, dark mineral surfaces, physically grounded imagery and restrained motion.

## Emotional goals

1. **Agency:** every primary action reads as deliberate and reversible consequences are explained before commitment.
2. **Gravity without punishment:** absence and reduced effort remain legitimate states; yellow indicates meaning, not guilt.
3. **World continuity:** images, labels, chapter rails and relationship traces imply that Meridian remembers prior action.
4. **Operational clarity:** account, privacy, save, offline and sync states remain plain and legible.

## Identity

- Dark-first graphite and mineral surfaces, not absolute black everywhere.
- Warm off-white primary text and a controlled brass-yellow semantic accent.
- Teal for stable/saved/online states; muted red only for destructive or conflict states.
- Condensed display typography for decisive statements, serif typography for narrative speech, mono labels for system state.
- Thin industrial rules, asymmetric editorial composition and selective full-bleed imagery.

## Anti-goals

- No generic SaaS dashboard.
- No grid of interchangeable rounded cards.
- No indiscriminate glassmorphism, neon glow or cyberpunk decoration.
- No animation that delays the user.
- No colour-only status communication.
- No loss of functionality for a cleaner screenshot.

## Composition rules

- One dominant visual proposition per screen.
- Primary CTA is unique within its local decision context.
- Story scenes use image–text tension; utility screens use compact data strips and functional panels.
- Mobile is recomposed into a bottom navigation shell; it is not a scaled desktop canvas.
- Long Russian copy is allowed to wrap naturally; display tracking is reduced for Cyrillic readability.

## Art direction

- Existing Meridian art is retained and framed with predictable crop, veil and focal-point treatment.
- Narrative imagery uses dark lower-third overlays to protect text contrast.
- Sensitive health/journal surfaces use quieter, less cinematic treatment.
- All image files are inventoried in `ASSET_INVENTORY.csv`; no new unlicensed font or image binary was added.

## Motion direction

- Fast feedback: 90–160 ms.
- Standard component transition: 260 ms.
- Slow contextual entrance: 440 ms.
- Cinematic transition ceiling: 720 ms, never blocking input.
- `prefers-reduced-motion` and the in-product reduced-motion preference remove decorative movement and preserve state changes.
