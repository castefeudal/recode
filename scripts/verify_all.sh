#!/usr/bin/env bash
set -euo pipefail
project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$project_root"
bash scripts/verify_source.sh
if [[ -x backend/.venv/bin/python ]] && backend/.venv/bin/python -c 'import fastapi,uvicorn,pydantic' >/dev/null 2>&1; then
  backend_python=backend/.venv/bin/python
elif python3 -c 'import fastapi,uvicorn,pydantic' >/dev/null 2>&1; then
  backend_python=python3
  echo 'Using preinstalled backend runtime; clean locked install evidence is still required.' | tee evidence/final/backend-runtime-source.txt
else
  echo 'Backend runtime dependencies are missing; run bash scripts/bootstrap.sh' >&2
  exit 69
fi
"$backend_python" -m unittest backend/tests/test_integration.py |& tee evidence/final/backend-integration.txt
if [[ ! -x web_app/node_modules/.bin/tsc ]]; then
  echo 'web_app/node_modules is missing; run bash scripts/bootstrap.sh' >&2
  exit 69
fi
(
  cd web_app
  npm run typecheck
  npm run lint
  npm test
  npm run validate:artifact
) |& tee evidence/final/web.txt
if command -v godot >/dev/null 2>&1; then
  godot --headless --path game --quit |& tee evidence/final/godot-smoke.txt
else
  echo 'Godot 4.6 runtime is required for the full verify_all gate.' >&2
  exit 69
fi
printf '%s\n' '{"full_verification":"PASS"}' | tee evidence/final/full-summary.json
