# Deployment report — canonical rebuild

## Pre-deployment

- Target: `castefeudal/recode`, base branch `main`.
- Safety tag: `backup/pre-canonical-rebuild-20260812`.
- Working branch: `agent/recode-canonical-premium-rebuild`.
- Pages build command verified locally with `GITHUB_REPOSITORY=castefeudal/recode`.
- Exported asset paths resolve under `/recode/` in generated HTML.

## Post-deployment record

- Canonical PR: [#4](https://github.com/castefeudal/recode/pull/4).
- Merge commit: `b4c1bdaa159f42a4e6ba361943c6b824cf3aea69`.
- CI run: `31607073930` — success.
- Pages workflow run: `31607073900` — success.
- Pages build/deployment run: `31607072783` — success.
- Production URL: https://castefeudal.github.io/recode/

The repository Pages API still reports the legacy `main:/` source. The Actions artifact therefore does not replace the legacy source on this repository. A follow-up compatibility change mirrors the verified static export at the repository root so the configured Pages source serves the same `/recode/` application while the Actions workflow remains the canonical build/deploy path. This is a deployment compatibility layer, not a replacement for the `web_app` source.
