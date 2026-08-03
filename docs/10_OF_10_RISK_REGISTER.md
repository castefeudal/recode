# 10/10 risk register

| ID | Risk | Likelihood | Impact | Mitigation | Residual state |
|---|---|---:|---:|---|---|
| R-01 | Release metadata drifts from runtime | High | Critical | Canonical `VERSION` plus automated consistency validator | Controlled |
| R-02 | Cloud API deployed with development secret | Medium | Critical | Production startup refuses weak/default secret | Controlled |
| R-03 | Save conflict overwrites progress | Medium | Critical | Optimistic revision contract, typed error parser and tests | Controlled for API contract; browser E2E pending |
| R-04 | Local save is corrupted/interrupted | Medium | High | primary/backup/temp strategy, migrations and fuzz tests | Partially controlled; browser interruption E2E pending |
| R-05 | Native integrations are mistaken for complete | High | High | capability-based adapters and explicit experimental scope | Controlled in claims; real device evidence pending |
| R-06 | Dependency installation cannot be reproduced | Medium | Critical | lockfiles, explicit CI setup and bootstrap; clean-run evidence required | Blocked in this environment by registry mirror |
| R-07 | Accessibility regressions | Medium | High | semantic controls, focus/reduced-motion rules, automated gate plan | Automated browser evidence pending |
| R-08 | Store/privacy declarations diverge from code | Medium | Critical | data map, opt-in cloud payload allowlist, truth audit | Legal/store review remains owner gate |
