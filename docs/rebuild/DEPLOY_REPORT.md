# Deployment report — canonical rebuild

## Pre-deployment

- Target: `castefeudal/recode`, base branch `main`.
- Safety tag: `backup/pre-canonical-rebuild-20260812`.
- Working branch: `agent/recode-canonical-premium-rebuild`.
- Pages build command verified locally with `GITHUB_REPOSITORY=castefeudal/recode`.
- Exported asset paths resolve under `/recode/` in generated HTML.

## Post-deployment record

- Canonical PR: [#4](https://github.com/castefeudal/recode/pull/4).
- Pages compatibility PRs: [#5](https://github.com/castefeudal/recode/pull/5), [#6](https://github.com/castefeudal/recode/pull/6).
- Final merge commit: `7b9fb8d6dcc1dd178240bddc0187754afe4ae96d`.
- Canonical CI run: `31607073930` — success.
- Final CI run: `31608659453` — success.
- Canonical Pages workflow run: `31607073900` — success.
- Final legacy Pages build/deployment run: `31608658664` — success.
- Production URL: https://castefeudal.github.io/recode/

The repository Pages API still reports the legacy `main:/` source. The Actions artifact therefore does not replace the legacy source on this repository. Follow-up compatibility changes mirror the verified static export at the repository root and add `.nojekyll`, so the configured Pages source serves the same `/recode/` application while the Actions workflow remains the canonical build/deploy path. This is a deployment compatibility layer, not a replacement for the `web_app` source.

## Production smoke

Verified in the production browser after the final Pages build: landing hydration, start-new-game, consent, Lost Form origin, identity entry, Today, first story scene, first choice, real action completion, Body library (80 visible / 1,324 total), Relations with portraits, Meridian map, Profile save/export controls, and no application console fatal errors. The browser provider did not expose durable localStorage inspection across a full navigation reload, so persistence is additionally covered by the automated save/migration suite rather than marked as an independent browser PASS.
