#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
version="$(tr -d '\r\n' < "$project_root/VERSION")"
output_dir="$project_root/dist/packages"
stage_dir="$(mktemp -d)"
trap 'rm -rf "$stage_dir"' EXIT

mkdir -p "$output_dir"
find "$output_dir" -maxdepth 1 -type f -name "MARKOVMADE_RECODE_${version}_*" -delete

cd "$project_root"
bash scripts/verify_all.sh
python3 tools/release/generate_release_metadata.py >/dev/null
python3 tools/validators/validate_version_consistency.py >/dev/null
python3 tools/validators/validate_campaign.py tools/creator_studio/example_campaign.mmc >/dev/null
python3 tools/validators/simulate_season.py --json dist/test-results/season-simulation.json >/dev/null
python3 tools/validators/simulate_balance.py --json dist/test-results/balance-simulation.json --csv dist/test-results/balance-simulation.csv >/dev/null
python3 tools/validators/editorial_audit.py --json dist/test-results/editorial-audit.json >/dev/null
test -f web_app/dist/server/index.js
test -f web_app/dist/.openai/hosting.json

zip -qr "$output_dir/MARKOVMADE_RECODE_${version}_SOURCE.zip" . \
  -x 'dist/*' '.git/*' 'web_app/node_modules/*' 'web_app/.next/*' \
     'web_app/.vinext/*' 'web_app/.sites-runtime/*' 'web_app/.wrangler/*' \
     'web_app/dist/*' 'web_app/*.tsbuildinfo' 'backend/.venv/*' 'backend/__pycache__/*' \
     'backend/app/__pycache__/*' 'backend/tests/__pycache__/*' \
     'tools/**/__pycache__/*' '*.pyc' '.env' '.env.local' \
     '.env.production' '.env.development' '.env.test' '*.log'

zip -qr "$output_dir/MARKOVMADE_RECODE_${version}_CONTENT_CREATOR_KIT.zip" \
  VERSION LICENSE ASSET_LICENSES.md THIRD_PARTY_NOTICES.md \
  game/narrative game/data tools/content tools/creator_studio tools/validators \
  docs/NARRATIVE_BIBLE.md docs/CHARACTER_BIBLE.md docs/GDD.md \
  docs/CONTENT_PIPELINE.md docs/CREATOR_STUDIO.md docs/TRACEABILITY_MATRIX.md \
  docs/NARRATIVE_EDITORIAL_REPORT.md docs/SEASON_SIMULATION_REPORT.md

zip -qr "$output_dir/MARKOVMADE_RECODE_${version}_PLATFORM_RELEASE_KIT.zip" \
  VERSION LICENSE .env.example game backend native_plugins scripts store \
  steamworks legal .github README.md RUN_ME_FIRST.md PROJECT_STATUS.md \
  DELIVERY_MANIFEST.md PRODUCT_TRUTH_AUDIT.md TEST_REPORT.md \
  QUALITY_SCORECARD.md BASELINE_AUDIT.md DEFECT_LOG.md \
  ASSET_LICENSES.md THIRD_PARTY_NOTICES.md docs/ANDROID_RELEASE.md \
  docs/IOS_RELEASE.md docs/STEAM_RELEASE.md docs/DESKTOP_RELEASE.md \
  docs/DEPLOYMENT.md docs/BACKEND_DEPLOYMENT.md docs/STORE_CHECKLIST.md \
  docs/SECURITY.md docs/PRIVACY.md docs/KNOWN_LIMITATIONS.md \
  -x 'backend/.venv/*' 'backend/__pycache__/*' 'backend/app/__pycache__/*' \
     'backend/tests/__pycache__/*' '*.pyc' '.env' '.env.local' \
     '.env.production' '.env.development' '.env.test' '*.log'

zip -qr "$output_dir/MARKOVMADE_RECODE_${version}_DOCUMENTATION.zip" \
  README.md RUN_ME_FIRST.md PROJECT_STATUS.md DELIVERY_MANIFEST.md \
  CHANGELOG.md RELEASE_NOTES.md PRODUCT_TRUTH_AUDIT.md TEST_REPORT.md ASSET_LICENSES.md \
  THIRD_PARTY_NOTICES.md LICENSE VERSION QUALITY_SCORECARD.md \
  BASELINE_AUDIT.md DEFECT_LOG.md docs legal

zip -qr "$output_dir/MARKOVMADE_RECODE_${version}_QA_EVIDENCE.zip" \
  VERSION QUALITY_SCORECARD.md BASELINE_AUDIT.md DEFECT_LOG.md TEST_REPORT.md \
  PRODUCT_TRUTH_AUDIT.md docs/qa docs/SEASON_SIMULATION_REPORT.md \
  docs/BALANCE_SIMULATION_REPORT.md docs/NARRATIVE_EDITORIAL_REPORT.md \
  docs/PERFORMANCE_REPORT.md docs/BACKEND_INTEGRATION_REPORT.md \
  docs/VISUAL_QA_REPORT.md docs/CREATOR_STUDIO_QA.md docs/GODOT_NATIVE_QA.md \
  docs/CREATOR_BROWSER_E2E.md docs/SBOM.cdx.json docs/PROVENANCE.json \
  docs/QUALITY_LOOPS.md docs/10_OF_10_BASELINE_AUDIT.md docs/10_OF_10_EVIDENCE_PLAN.md owner_gates web_app/tests backend/tests dist/test-results evidence

zip -qr "$output_dir/MARKOVMADE_RECODE_${version}_MEDIA_KIT.zip" \
  VERSION ASSET_LICENSES.md art_prompts art_source/generated \
  web_app/public/art/key web_app/public/og-recode-v7.jpg \
  web_app/public/icon-192.png web_app/public/icon-512.png \
  store/press_kit

mkdir -p "$stage_dir/MARKOVMADE_RECODE_${version}_WEB_BUILD"
cp -a web_app/dist "$stage_dir/MARKOVMADE_RECODE_${version}_WEB_BUILD/dist"
cp web_app/DEPLOY_BUILD.md "$stage_dir/MARKOVMADE_RECODE_${version}_WEB_BUILD/README.md"
tar -C "$stage_dir" -czf "$output_dir/MARKOVMADE_RECODE_${version}_WEB_BUILD.tar.gz" \
  "MARKOVMADE_RECODE_${version}_WEB_BUILD"

(
  cd "$output_dir"
  sha256sum \
    "MARKOVMADE_RECODE_${version}_SOURCE.zip" \
    "MARKOVMADE_RECODE_${version}_WEB_BUILD.tar.gz" \
    "MARKOVMADE_RECODE_${version}_CONTENT_CREATOR_KIT.zip" \
    "MARKOVMADE_RECODE_${version}_PLATFORM_RELEASE_KIT.zip" \
    "MARKOVMADE_RECODE_${version}_DOCUMENTATION.zip" \
    "MARKOVMADE_RECODE_${version}_QA_EVIDENCE.zip" \
    "MARKOVMADE_RECODE_${version}_MEDIA_KIT.zip" \
    > "MARKOVMADE_RECODE_${version}_SHA256SUMS.txt"
)

for archive in "$output_dir"/*.zip; do unzip -tq "$archive" >/dev/null; done
tar -tzf "$output_dir/MARKOVMADE_RECODE_${version}_WEB_BUILD.tar.gz" >/dev/null
(cd "$output_dir" && sha256sum -c "MARKOVMADE_RECODE_${version}_SHA256SUMS.txt")

if unzip -Z1 "$output_dir/MARKOVMADE_RECODE_${version}_SOURCE.zip" | \
  grep -E '(^|/)(node_modules|\.env($|\.)|\.git|__pycache__|\.wrangler|\.sites-runtime)(/|$)' >/dev/null; then
  echo "Forbidden path detected in source archive" >&2
  exit 1
fi

mkdir -p "$stage_dir/secret-scan"
unzip -q "$output_dir/MARKOVMADE_RECODE_${version}_SOURCE.zip" -d "$stage_dir/secret-scan"
if rg -n --hidden --glob '!sources/**' \
  'BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY|sk-[A-Za-z0-9_-]{20,}|AKIA[0-9A-Z]{16}' \
  "$stage_dir/secret-scan" >/dev/null; then
  echo "Possible secret detected in source archive" >&2
  exit 1
fi

python3 "$stage_dir/secret-scan/tools/validators/validate_project.py" >/dev/null
python3 "$stage_dir/secret-scan/tools/validators/validate_version_consistency.py" >/dev/null
python3 "$stage_dir/secret-scan/tools/validators/simulate_season.py" >/dev/null

ls -lh "$output_dir"/MARKOVMADE_RECODE_"${version}"_*
