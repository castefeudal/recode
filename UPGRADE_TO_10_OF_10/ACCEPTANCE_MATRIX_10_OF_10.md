# MARKOVMADE: RECODE — матрица приёмки 10/10

Статусы: `PASS`, `FAIL`, `BLOCKED_EXTERNAL`, `NOT_RUN`. Для итогового 10/10 все обязательные строки должны быть `PASS`; `BLOCKED_EXTERNAL` не считается 10/10, но допускается в честном pre-release пакете.

| ID | Направление | Обязательный критерий | Доказательство |
|---|---|---|---|
| REL-01 | Versioning | Один canonical version source; ноль несовпадений в коде, документации, SBOM, provenance и архивах | automated consistency test |
| REL-02 | Validation | Все project gates проходят | JSON/JUnit + exit 0 |
| REL-03 | Packaging | Все ZIP/TAR извлекаются без ошибок | archive test log |
| REL-04 | Packaging | SHA-256 сходится для каждого выдаваемого файла | checksum manifest |
| REL-05 | Reproducibility | Build/package проходит из clean checkout | CI artifact + provenance |
| CI-01 | CI | Node, Python, backend deps, Godot и Java устанавливаются явно | workflow logs |
| CI-02 | CI | Ни один обязательный gate не `SKIPPED` | test summary |
| CI-03 | CI | Required checks блокируют merge | branch protection evidence/config |
| ARC-01 | Architecture | Domain/application/infrastructure/presentation разделены | architecture map + tests |
| ARC-02 | Architecture | Монолитный Web page декомпозирован | module map + review |
| ARC-03 | Architecture | Shared contracts типизированы и не дублируются | schema/codegen tests |
| WEB-01 | Web | `npm ci` и production build проходят на clean Node | CI logs |
| WEB-02 | PWA | Install/offline/update lifecycle проходит E2E | browser E2E report |
| WEB-03 | UX | Все critical journeys имеют loading/error/offline/conflict states | E2E + screenshots |
| WEB-04 | Performance | Lighthouse/CWV и asset budgets соответствуют целям | machine report |
| UX-01 | Core loop | CHOICE → ACTION → WORLD очевиден в первой сессии | usability evidence + E2E |
| UX-02 | Responsive | Нет critical overflow/layout defects на matrix | visual report |
| UX-03 | Design system | Tokens/components documented and used | Storybook/catalog or equivalent |
| A11Y-01 | Accessibility | WCAG 2.2 AA в заявленном scope | audit report |
| A11Y-02 | Accessibility | Zero critical/serious automated violations | axe/pa11y report |
| A11Y-03 | Accessibility | Keyboard/screen-reader critical journeys | manual evidence |
| DATA-01 | Save | Единая schema semantics Web/Godot/backend | contract test |
| DATA-02 | Migration | Все поддерживаемые миграции идемпотентны | property tests |
| DATA-03 | Integrity | Corruption/import/oversize/interruption recovery | fuzz/E2E logs |
| API-01 | Backend | Production refuses default secret | startup test |
| API-02 | Auth | Register/login/refresh/revoke/logout-all/delete/export | integration suite |
| API-03 | Sync | Revision conflicts согласованы с клиентом | contract + browser E2E |
| API-04 | Storage | Migrations, concurrency, backup и restore проверены | integration/runbook evidence |
| API-05 | Operations | Readiness, metrics, structured logs, SLO | ops report |
| SEC-01 | Security | Threat model и data-flow map актуальны | security docs |
| SEC-02 | Security | Zero unaccepted critical/high issues | scan reports |
| SEC-03 | Supply chain | SBOM, provenance, secret/license/dependency scans | CI artifacts |
| PRIV-01 | Privacy | Data map совпадает с code behavior и policies | privacy verification |
| PRIV-02 | Privacy | Sensitive data cloud opt-in only | tests + code review |
| NAT-01 | Godot | Headless runtime/parse smoke passes | CI log |
| NAT-02 | Builds | Desktop/mobile exports собираются на корректных runners | artifacts |
| NAT-03 | Integrations | Native features real or removed from claims | adapter tests + scope docs |
| CONT-01 | Narrative | Reachability/references/variants/endings validated | validator report |
| CONT-02 | Editorial | RU/EN semantic review and health-claim review | editorial report |
| CONT-03 | Creator | Import/export/migration/undo/recovery E2E | creator test report |
| TEST-01 | Unit | Critical domain line/branch coverage ≥95% | coverage report |
| TEST-02 | Overall | App line ≥85%, branch ≥80%, risk exceptions documented | coverage report |
| TEST-03 | E2E | 100% critical journeys automated | traceability matrix |
| TEST-04 | Stability | Zero flaky failures in 10 consecutive runs | repeat-run report |
| TEST-05 | Test quality | Mutation/equivalent quality check for critical modules | mutation report |
| PERF-01 | Backend | Load targets defined and met | k6/Locust report |
| PERF-02 | Client | Bundle, image, startup and interaction budgets met | performance report |
| LOC-01 | Localization | Zero hardcoded user-facing strings/missing keys | lint/test |
| LOC-02 | Localization | RU/EN expansion, dates, units, pluralization | localization report |
| DOC-01 | Documentation | Clean-machine RUN_ME_FIRST works verbatim | external/clean-run evidence |
| DOC-02 | Truth | README/status/store claims match evidence | truth audit |
| LEG-01 | Legal | Licenses, notices, privacy and terms are internally consistent | legal-readiness audit |
| STORE-01 | Store | Metadata/data safety forms reflect real behavior | store checklist |
| OPS-01 | Recovery | Rollback, failed migration, database restore runbooks tested | exercise report |
| HAND-01 | Handoff | New engineer can build/test/package from docs | handoff exercise |
