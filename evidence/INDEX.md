# Evidence index

## Baseline

- `baseline/environment.txt`
- `baseline/exit_codes.txt`
- `baseline/validate_project.log`
- `baseline/test_sh.log` and `test_sh_bash.log`
- `baseline/package_release.log` and `package_release_bash.log`

## Final passing evidence

- `final/version-consistency.json`
- `final/validate-project.json`
- `final/architecture.json`
- `final/native-scope.json`
- `final/backend-source-tests.txt`
- `final/backend-integration.txt`
- `final/backend-production-guard.txt`
- `final/web-source-domain-tests.txt`
- `final/typescript-syntax.txt`
- `final/creator-roundtrip.txt`
- `final/season-simulation.json`
- `final/balance-simulation.json` and CSV
- `final/editorial-audit.json`
- `final/source-summary.json`

## Expected blocked full gates

- `final/verify-all-console.txt` — exit 69 at missing Web dependencies.
- `final/package-release-console.txt` — exit 69 because strict full verification did not pass.
- `final/ENVIRONMENT_BLOCKERS.md`.
