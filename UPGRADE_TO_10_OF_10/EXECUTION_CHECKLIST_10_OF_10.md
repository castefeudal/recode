# Исполнительный чек-лист 10/10

## P0 — исправить до любой новой функциональности

- [ ] Снять неизменённый baseline и сохранить результаты.
- [ ] Устранить все расхождения `6.0.0`/`7.0.0` через canonical version source.
- [ ] Исправить две падающие проверки validator и получить полный PASS.
- [ ] Исправить CI: setup Node, `npm ci`, backend environment, явные versions.
- [ ] Исправить Web ↔ backend revision-conflict contract.
- [ ] Запретить production backend с default secret.
- [ ] Убрать ложные production-claims о native/scaffolding.
- [ ] Сделать release packaging воспроизводимым и самопроверяющимся.

## P1 — довести инженерную основу

- [ ] Characterization tests до рефакторинга.
- [ ] Декомпозиция Web по feature/domain boundaries.
- [ ] Shared schemas и generated API types.
- [ ] Production database migrations, backup/restore и concurrency strategy.
- [ ] Session lifecycle, revocation, recovery/verification.
- [ ] Godot service inventory: production/experimental/removed.
- [ ] Реальные native adapters или feature removal.
- [ ] Threat model, data map, SBOM, provenance.

## P1 — пользовательское качество

- [ ] Полный UX audit onboarding/Today/Story/action/settings/sync/data rights.
- [ ] Design tokens и reusable component system.
- [ ] Offline, retry, conflict, permission, empty, loading, error states.
- [ ] WCAG 2.2 AA, keyboard, screen reader, contrast, zoom, reduced motion.
- [ ] Browser/device/responsive visual matrix.
- [ ] RU/EN semantic parity и pseudo-localization.

## P1 — доказательства

- [ ] Unit/property/fuzz/contract/integration/E2E/visual/a11y/performance suites.
- [ ] 10 последовательных прогонов без flaky failures.
- [ ] Clean checkout bootstrap → verify → build → package.
- [ ] Every artifact extraction + secret scan + post-extraction validation.
- [ ] SHA-256 manifest, SBOM, provenance, evidence index.

## Owner gates, которые нельзя имитировать

- [ ] Apple/Google/Steam developer accounts.
- [ ] Production signing certificates and secrets.
- [ ] Physical device lab.
- [ ] External pentest.
- [ ] Professional legal/clinical review.
- [ ] Blind human playtests and accessibility testing with users.
- [ ] Store review and publication.

Для каждого недоступного owner gate создай пакет: точная инструкция, входные данные, ожидаемый результат, критерий PASS/FAIL и место для evidence.
