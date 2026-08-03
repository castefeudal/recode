# MARKOVMADE: RECODE 7.0.0 — remediation release notes

This source remediation resolves the confirmed release-truth and P0 engineering defects without claiming external completion.

## Implemented

- canonical version synchronization and validation across runtime, manifests, SBOM and provenance;
- 71/71 project validator pass;
- explicit clean-run CI provisioning for Node, Python, npm, backend, Godot and Java;
- strict `verify_source.sh` and `verify_all.sh` with no mandatory SKIPPED state;
- Web storage/cloud boundaries extracted from the main page;
- save-conflict contract aligned with `error.server_revision`;
- cloud payload converted from exclusion to explicit allowlist;
- backend production-secret guard, standards-shaped HS256 JWT claims, session inventory/logout-all, readiness, metrics, structured logs and safer SQLite transactions;
- native health capability checks; mock restricted to debug/editor; misleading desktop health adapter disabled;
- evidence, threat model, data-flow and external owner-gate package.

## Evidence boundary

Source/content/domain gates pass in the included environment. Clean npm/pip installation, Web production build, backend integration, Godot, browser/device, signing, stores and independent reviews remain unverified because the necessary registry/runtime/accounts/hardware were unavailable. See `docs/10_OF_10_ACCEPTANCE_STATUS.md`.
