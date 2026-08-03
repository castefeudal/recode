# Test report — 7.0.0 remediation

## Passing in this workspace

- project validator: 71/71;
- version consistency: 9/9;
- architecture guard: 6/6;
- native scope guard: 6/6;
- backend source/config tests: 4/4;
- Creator roundtrip: 2/2;
- Web source/PWA/editorial contracts: 5/5;
- Web save/migration domain tests: 3/3 using Node type stripping;
- season, balance and editorial machine reports generated successfully.

## Not run as PASS

- npm clean install/build/typecheck/lint/build-dependent tests;
- backend Uvicorn integration suite;
- Godot headless parse/export;
- browser E2E, Lighthouse, axe, visual regression and physical devices.

The cause and exact owner/environment gates are recorded in `evidence/final/ENVIRONMENT_BLOCKERS.md`.
