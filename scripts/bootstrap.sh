#!/usr/bin/env bash
set -euo pipefail
project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$project_root"
python3 --version
node --version
npm --version
python3 -m venv backend/.venv
backend/.venv/bin/python -m pip install --upgrade pip
backend/.venv/bin/pip install --requirement backend/requirements.txt
(
  cd web_app
  npm run install:ci
)
python3 tools/release/sync_version.py
python3 tools/release/generate_release_metadata.py
printf '%s\n' 'Bootstrap complete. Run: bash scripts/verify_all.sh'
