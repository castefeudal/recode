# 10/10 evidence plan

Every acceptance row must point to machine output under `evidence/` or to an explicit owner-gate record. A document without a command log is not a PASS.

## Machine evidence

- `evidence/baseline/`: immutable pre-change results.
- `evidence/final/validate-project.json`: project gates.
- `evidence/final/version-consistency.json`: canonical version validation.
- `evidence/final/backend-contract.txt`: backend static contract suite.
- `evidence/final/backend-config.txt`: production guard suite.
- `evidence/final/season-simulation.json`, `balance-simulation.json`, `editorial-audit.json`.
- `evidence/final/archive-verification.txt` and `SHA256SUMS.txt`.

## Evidence that requires an external runner or owner

Browser E2E, Lighthouse, axe, signed native exports, physical-device integrations, external pentest, legal/clinical review, blind playtest and store review remain `BLOCKED_EXTERNAL` until their raw reports are attached. See `owner_gates/`.
