# Test report — canonical rebuild

Assessment date: 2026-08-12.

| Command | Result |
|---|---|
| `env NPM_CONFIG_CACHE=/tmp/recode-npm-cache npm ci --no-audit --no-fund` | PASS — 516 packages installed from lockfile |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm test` | PASS — 47/47 web tests |
| `bash scripts/verify_source.sh` | PASS — project validator 71/71; source gates passed |
| `GITHUB_ACTIONS=true GITHUB_REPOSITORY=castefeudal/recode npx next build` | PASS — static Pages export, 6 app routes |
| content integrity test | PASS — 14/140/420/70/8, 275, 160, 1,324, 8 |

## Not claimed

No physical-device, axe, Lighthouse, Godot export, signed-native, human validation or production browser PASS is claimed before those checks run in their proper environment.
