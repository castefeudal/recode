# 10/10 traceability map

| Acceptance group | Implementation/evidence |
|---|---|
| REL-01/02 | `VERSION`, `tools/validators/validate_version_consistency.py`, `validate_project.py` |
| CI-01/02 | `.github/workflows/ci.yml`, `scripts/bootstrap.sh`, `scripts/verify_all.sh` |
| ARC-02/API-03 | `web_app/app/infrastructure/*`, `web_app/app/components/CloudPanel.tsx` |
| API-01/02/05 | `backend/app/main.py`, backend tests, `docs/BACKEND_DEPLOYMENT.md` |
| SEC-01/PRIV-01 | `docs/SECURITY.md`, `docs/PRIVACY.md`, `docs/DATA_FLOW_MAP.md` |
| NAT-03 | `game/providers/*`, `docs/NATIVE_RELEASE_STATUS.md` |
| REL-03/04 | `scripts/package_release.sh`, release SHA-256 manifest |
| External rows | `owner_gates/OWNER_GATE_MATRIX.md` |
