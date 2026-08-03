# Backend integration report

Executed with the locked `backend/requirements.txt` inside an isolated venv.

## Black-box lifecycle

`backend/tests/test_integration.py` starts a real Uvicorn process against a
temporary SQLite database and verifies:

- `/health` version and production-secret signal;
- exact allowed CORS origin;
- `Cache-Control`, `nosniff` and security headers;
- register and duplicate-register `409`;
- authenticated save creation;
- optimistic revision conflict `409`;
- save read and portable export;
- one-time refresh-token rotation and rejection of reuse;
- deterministic non-medical mentor response;
- cascade account deletion and rejected subsequent login.

Result: **PASS**.

## Defect found and fixed

The first integration run reproduced an SQLite lock after duplicate
registration. The failed transaction was rolled back and all endpoint database
connections now close in `finally` blocks. The complete lifecycle passed after
the fix.

## Remaining production gates

- Docker compose: **SKIPPED**, Docker unavailable.
- Staging load, backup/restore, DAST and penetration testing: **OWNER/EXTERNAL**.
- Production secret, HTTPS termination and exact production CORS: **OWNER**.
