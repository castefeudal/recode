# MARKOVMADE: RECODE 3.0.0 — Web Build

Это production Worker artifact. Внутри `dist/server/index.js` экспортирует ESM `default.fetch`, а `dist/.openai/hosting.json` фиксирует hosting contract.

## Проверка

```bash
test -f dist/server/index.js
test -f dist/.openai/hosting.json
```

Оба вызова должны завершиться кодом `0`. Этот архив не содержит Node source/dependencies и предназначен для совместимого Worker/Sites deploy pipeline. Для локальной разработки используйте `SOURCE.zip/web_app`, `npm run install:ci`, затем `npm run dev`.

Не добавляйте `.env` или secrets в `dist`. Optional cloud API URL задаётся владельцем; offline gameplay работает без него.
