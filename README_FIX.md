# GitHub Pages hotfix 01

Fixes the static Next.js build failing on `cloudflare:workers` from `web_app/db/index.ts`.
The GitHub Pages build does not use the Cloudflare D1 example/database layer, so the Pages TypeScript scope is limited to the actual application source.

Copy `web_app/tsconfig.json` into the repository root, replacing the existing file, then commit and push.
