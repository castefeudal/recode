# GitHub/Cloudflare deployment package changes

This package preserves the complete MARKOVMADE: RECODE source tree and adds deployment ergonomics only.

Added:

- root `.gitignore`;
- `START_HERE_GITHUB_DEPLOY.md`;
- Windows/macOS/Linux local start scripts;
- Windows/macOS/Linux GitHub upload scripts;
- Cloudflare Worker configuration;
- GitHub Actions Web deployment workflow;
- optional backend test environment template;
- complete SHA-256 manifest for this GitHub-ready package.

Adjusted:

- `web_app/vite.config.ts` now reads the standard `wrangler.jsonc` input configuration;
- `web_app/package.json` includes preview, deploy and Web verification commands;
- native export CI jobs are manual so a normal source push does not start four platform builds automatically;
- root README links to the deployment guide.

Not included:

- `node_modules`;
- Python virtual environments;
- local caches;
- secrets;
- local database files;
- generated deployment output.

These are intentionally restored or generated in CI and must not be committed to GitHub.
