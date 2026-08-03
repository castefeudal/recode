# Release 7.0.0 — Cinematic Narrative Rebuild

## Итог

Web-продукт переработан в полноценный кинематографичный Life RPG: 140 сцен, 420 решений, 70 возвращающихся последствий, 14 глав, 30 критических ветвлений и 8 четырёхактных финалов.

## Проверенная матрица

| Область | Результат |
|---|---|
| Production build | PASS |
| TypeScript | PASS |
| ESLint | PASS |
| Автоматические тесты | 7/7 PASS |
| Editorial anti-boilerplate | PASS |
| Save/migration fuzz | PASS |
| Browser onboarding/gameplay smoke | PASS |
| RU/EN | PASS |
| High contrast | PASS |
| Horizontal overflow, desktop | 0 px |
| Production dependency audit | 0 vulnerabilities |
| OpenAI Sites deployment | SUCCEEDED, version 10 |

## Визуальный релиз

- Новый экран «Сегодня» с образом утра перед решением.
- Новая сцена истории с Мирой и пространством Meridian.
- Новое состояние города с контрастом восстановленной и холодной зон.
- Новый OG-preview 1200×630.
- WebP-доставка ключевых артов и сохранение PNG-источников.

## Редакционный релиз

- Удалены повторяющиеся шаблонные фразы прежней генерации.
- Все полные тексты сцен, диалоги и тексты выборов уникальны в RU и EN.
- Введён воспроизводимый `tests/editorial-quality.test.mjs`.
- `human_review_claimed=false`: автоматический gate не выдаётся за независимую литературную редактуру.

## Совместимость

Игровой релиз имеет номер 7.0.0, но save schema остаётся 6 для обратной совместимости. Поддерживаются миграции схем 3–6.
