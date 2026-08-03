# Known limitations — 7.0.0

- Web is deployed owner-only; access was intentionally not widened.
- Physical mobile/tablet, cross-browser, install/update and quota matrices are
  not executed.
- Lighthouse/CWV and full screen-reader certification are absent.
- Narrative passed structural bilingual audit, not a human literary edit.
- Balance uses deterministic fixtures, not player telemetry.
- Current Next.js dependency tree has 3 open high audit groups; see
  `SECURITY_REPORT.md`.
- Backend needs production TLS, secrets, monitoring, backup, DAST/pentest.
- Godot runtime, exports, health bridges and signed binaries are unverified.
- WAV assets are prototype audio, not final composed/mastered score.
- AI-generated art needs owner trademark/likeness/platform review.
- Legal, clinical, ratings and store approvals are external.

These limitations do not block the owner-only Web/PWA build; they block claims
of a universally certified or signed commercial multi-platform release.
