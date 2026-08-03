# 10/10 baseline audit — MARKOVMADE: RECODE 7.0.0

Captured before engineering changes on 2026-08-03. Raw command output is stored under `evidence/baseline/`.

| Finding | Status | Evidence | Severity | Root cause | Regression prevention |
|---|---|---|---|---|---|
| Current release files disagree between 6.0.0 and 7.0.0 | CONFIRMED | `VERSION`; `backend/app/main.py:36,222`; `game/project.godot:4`; current release documents | Critical | Version duplicated manually across runtime and release metadata | `tools/validators/validate_version_consistency.py` |
| Project validator has two failures | CONFIRMED | `evidence/baseline/validate_project.log` | Critical | Exact stale source-string check and hard-coded 6.0.0 assertion | Dynamic validator tied to canonical `VERSION` |
| Main CI job is not clean-run reproducible | CONFIRMED | `.github/workflows/ci.yml` originally omitted Node setup, `npm ci`, and backend install | Critical | CI invoked aggregate tests before provisioning dependencies | Explicit setup/bootstrap steps and dependency-cache keys |
| Web/backend save-conflict contract differs | CONFIRMED | server emits `error.server_revision`; Web read `detail.server_revision` | High | No shared API error parser/contract test | typed client adapter plus static and integration contract tests |
| Web presentation layer is excessively coupled | CONFIRMED | `web_app/app/page.tsx` combined storage, SW, auth/sync and screens | High | Vertical-slice implementation grew without boundaries | infrastructure adapters and extracted Cloud component; architecture validator |
| Backend is a development prototype | CONFIRMED | default secret, custom token shape, process-local rate limiter, no session inventory/readiness/metrics | Critical | Prototype perimeter was described more strongly than implemented | production startup guard, standards-shaped JWT, session lifecycle, readiness/metrics and explicit limitations |
| Godot/native scope contains scaffolding | CONFIRMED | many services under 300 bytes; platform providers returned unconditional availability | High | Platform adapters were created before real SDK integration | capability-based providers and native inventory validator; claims downgraded |
| UX/browser/offline/accessibility/device evidence is incomplete | CONFIRMED | structural tests dominate; no browser/device runner evidence in archive | High | Testing focused on content and model correctness | test-plan gates and owner-gate package; no 10/10 claim without evidence |
| Documentation exceeds evidence | CONFIRMED | status/store/deployment documents used production-ready language despite owner-only deployment and unsigned native builds | High | Release copy was not generated from evidence state | truth audit and evidence-index requirements |
| Shell scripts are not executable after ZIP extraction | CONFIRMED | direct execution returned exit code 126 | High | executable mode was not preserved by ZIP delivery | packaging mode check and documented `bash` fallback |

## Baseline exit codes

- `python3 tools/validators/validate_project.py`: **1** — 69/71 checks.
- `./scripts/test.sh`: **126** — permission denied.
- `bash scripts/test.sh`: **1** — stopped at validator.
- `./scripts/package_release.sh`: **126** — permission denied.
- `bash scripts/package_release.sh`: **1** — stopped at validator.
- Godot runtime: **not installed in the execution environment**.
- `npm ci`: **blocked by package-registry mirror missing `zod-validation-error@4.0.2`**.
- backend dependency installation: **blocked by package-registry mirror not exposing pinned FastAPI**.

The last three items are environment blockers, not test passes. They remain explicit in the owner-gate/evidence package.
