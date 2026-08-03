# Accessibility report — 7.0.0

## Verified in this session

- semantic landmarks, headings and navigation exposed in browser snapshot;
- skip links for landing/onboarding/game content;
- labelled consent checkbox and disabled/enabled continuation state;
- labelled product-proof region and pressed state;
- accessible resource/status labels and live status messages;
- keyboard-native buttons/inputs; no pointer-only core action;
- explicit high-contrast control and visible state;
- RU/EN accessible names update with locale;
- motion toggle and `prefers-reduced-motion` support in CSS;
- decorative treatments do not carry the only copy of information.

## Result

Foundation: **PASS**. Formal WCAG 2.2 AA certification: **NOT CLAIMED**.

## Required human/AT gate

Run NVDA+Firefox, JAWS+Chrome, VoiceOver+iOS/macOS and TalkBack+Android.
Verify focus order, screen-reader announcement after choice/action/update,
zoom 200/400%, forced colors, switch control, dynamic type and keyboard-only
completion. Record device, OS, browser, AT version, defect, severity and video.
