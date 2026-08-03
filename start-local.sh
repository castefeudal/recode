#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/web_app"
command -v node >/dev/null || { echo "Install Node.js 22.16+ first." >&2; exit 1; }
node -e 'const [major,minor]=process.versions.node.split(".").map(Number); if(major<22||(major===22&&minor<13)){console.error("Node.js 22.13+ is required");process.exit(1)}'
if [[ ! -d node_modules ]]; then
  npm ci --no-audit --no-fund
fi
npm run dev
