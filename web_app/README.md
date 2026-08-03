# MARKOVMADE: RECODE Web/PWA — 7.0.0

Полностью проходимый offline-first vertical продукта с кинематографическим
игровым интерфейсом, двуязычным Season 01 и сохранением схемы 6.

Версия 7.0.0 сохраняет совместимость с пользовательскими сохранениями v3–v6.
Сезон получил редакционный проход против boilerplate-повторов, новые
сценарные формулировки и отдельный semantic-repetition gate. Автоматическая
редактура не подменяет независимый human literary review.

```bash
npm run install:ci
npm run dev
```

Production gate:

```bash
npm run lint
npm test
npm run validate:artifact
```

`npm test` выполняет production build и rendered contract test. `dist/` — Sites/Worker artifact, а не обычный static-only каталог. Runtime story/save не требуют API; optional cloud настраивается пользователем явным URL и consent.

Требования: Node.js ≥22.13, npm lockfile install. Если install падает из-за прав cache, укажите writable cache: `npm --cache /tmp/recode-npm-cache run install:ci`.

**Original concept, system and authorship: Павел Марков / Pavel Markov / MARKOVMADE**
