# Removal decisions

No functional Source A subsystem was removed.

| Candidate | Decision | Reason |
|---|---|---|
| Source A game/backend/native/docs | retained | These are the canonical full-product foundation and are not required in the Pages initial bundle. |
| Source B single-file demo shell | not copied over current shell | Current main already has the same narrative screens plus later save, recovery, training and design-system improvements. Copying it wholesale would regress architecture and product depth. |
| Source A WAV music/SFX from Pages runtime | source-only, not deleted | Autoplay, volume persistence, reduced-sensory mode and browser policy need a dedicated opt-in audio surface. Silent omission from runtime is documented; source provenance is preserved. |
| Existing V6/V7 web art | retained | It remains useful for mobile hero fallback, today, story and supporting surfaces. V10 is additive, not destructive. |
| Generated build folders / `node_modules` | not committed | Reproducible artifacts and dependencies are excluded by existing ignore rules. |

