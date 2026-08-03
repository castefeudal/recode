# Environment and owner blockers observed on 2026-08-03

| Command/gate | Result | Classification |
|---|---|---|
| `npm ci --ignore-scripts` | FAIL: configured registry mirror returned 404 for `zod-validation-error-4.0.2.tgz` | clean-install evidence blocked |
| direct public npm registry | DNS/network unavailable to the execution container | network policy blocker |
| locked backend `pip install -r backend/requirements.txt` | FAIL: configured mirror exposed no matching `fastapi==0.116.1` | clean-install evidence blocked |
| backend integration using preinstalled FastAPI/Uvicorn/Pydantic | PASS: 2/2 | runtime behavior verified, but not locked-install reproducibility |
| `godot --version` | command not found | Godot parse/export blocked |
| browser/Lighthouse/axe/visual runners | unavailable because Web dependency installation was blocked | browser evidence blocked |
| signing, stores, physical devices, pentest, legal/clinical, human studies | external credentials/hardware/reviewers absent | owner gates |

None of the blocked rows is converted to PASS.
