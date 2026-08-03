#!/usr/bin/env bash
set -euo pipefail
project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$project_root"
mkdir -p evidence/final dist/test-results
python3 tools/validators/validate_version_consistency.py | tee evidence/final/version-consistency.json
python3 tools/validators/validate_project.py | tee evidence/final/validate-project.json
python3 tools/validators/validate_architecture.py | tee evidence/final/architecture.json
python3 tools/validators/validate_native_scope.py | tee evidence/final/native-scope.json
python3 tools/validators/validate_visual_design.py | tee evidence/final/visual-design.json
python3 -m py_compile backend/app/main.py tools/validators/*.py tools/release/*.py
python3 -m unittest backend/tests/test_contract.py backend/tests/test_config.py |& tee evidence/final/backend-source-tests.txt
python3 -m unittest tools/creator_studio/test_roundtrip.py |& tee evidence/final/creator-roundtrip.txt
(
  cd web_app
  node --test tests/editorial-quality.test.mjs tests/cloud-contract.test.mjs tests/pwa-contract.test.mjs tests/design-system-contract.test.mjs
  node --experimental-strip-types --test tests/save-and-rules.test.mjs
) |& tee evidence/final/web-source-domain-tests.txt
python3 tools/validators/simulate_season.py --json evidence/final/season-simulation.json >/dev/null
python3 tools/validators/simulate_balance.py --json evidence/final/balance-simulation.json --csv evidence/final/balance-simulation.csv >/dev/null
python3 tools/validators/editorial_audit.py --json evidence/final/editorial-audit.json >/dev/null
printf '%s\n' '{"source_verification":"PASS"}' | tee evidence/final/source-summary.json
