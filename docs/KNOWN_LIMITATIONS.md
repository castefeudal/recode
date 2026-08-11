# Known limitations — 7.0.0 premium rebuild slice

## Product / architecture

- The high-value Web flows are now separated into Today/Command, Progress, Training, Recovery and Setup, but the original `web_app/app/page.tsx` still owns several legacy Life/World screens and remains a large migration target.
- Structured Training and personalization intentionally use separate local schema-v1 stores. Completed workouts bridge into canonical GameState, but legacy string workout history is not destructively rewritten into the structured store.
- Nutrition, Mind, Focus, Relationships and Meridian still contain more legacy implementation than the rebuilt P0/P1 surfaces; they have not all received the same depth in this slice.
- The recommendation system is transparent deterministic rules. It is not machine learning and must not be marketed as AI.
- Recovery uses self-reported/local observations and conservative rules. It is not a validated readiness algorithm, diagnosis or medical prescription.

## Web / UX evidence

- Current CI verifies source contracts, TypeScript, lint error gates, production build, rendered production metadata/base-path smoke and domain/unit logic; it is not a substitute for manual browser QA.
- Physical mobile/tablet, short-viewport, landscape and cross-browser matrices have not been executed on the final premium head.
- Browser E2E for the complete new-user → action → world-response → return → review loop is not included in the final CI evidence yet.
- Lighthouse/Core Web Vitals are not measured on the final head.
- Full screen-reader / assistive-technology validation is absent. Static accessibility contracts passing does not establish WCAG 2.2 AA conformance.
- ESLint currently reports legacy `<img>` performance warnings in the design-system component inventory; they are warnings, not CI errors.

## Native / release

- Web deployment remains owner-controlled; this PR does not merge or deploy itself.
- Godot Linux, Windows, Android and Apple export jobs are conditional on manual `workflow_dispatch`; PR runs showing those jobs as `skipped` are **NOT** native build passes.
- Godot runtime, physical-device health bridges, signing and store binaries remain unverified for this premium Web slice.
- Backend still needs production TLS/secrets/monitoring/backup and external DAST/pentest evidence for a public production service.
- Current Next.js dependency tree security status must continue to be tracked in `SECURITY_REPORT.md`; this rebuild does not claim dependency-vulnerability remediation unless separately evidenced.
- WAV assets remain prototype audio rather than a final composed/mastered score.
- AI-generated art still requires owner trademark/likeness/platform review.
- Legal, clinical, ratings and store approvals remain external gates.

These limitations do not invalidate the verified owner-controlled Web/PWA build. They block claims of universal browser/device certification, WCAG certification, validated health recommendations, signed native readiness or store-ready commercial release.
