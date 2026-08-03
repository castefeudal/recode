# Privacy Engineering Note

## Default

Игра offline-first: аккаунт не требуется. Analytics, cloud, AI и health — независимые opt-in контуры, выключенные по умолчанию. Отказ не закрывает основной сезон.

## Данные

| Категория | По умолчанию | Optional cloud |
|---|---|---|
| Story/progress/settings | localStorage | только после отдельного consent |
| Journal | local only | исключён клиентом |
| Food/sleep logs | local only | исключены клиентом |
| Email/password | отсутствуют | API account; password только scrypt hash |
| Tokens | отсутствуют | sessionStorage, не localStorage |
| Health data | manual route | только отдельный platform consent |

Profile предоставляет export, import, backup recovery и local delete. API предоставляет export/delete account data. Удаление local data необратимо; cloud deletion требует авторизованный запрос и должен быть проверен владельцем на production.

## Запрещено

- продавать или использовать journal/health text для рекламы;
- отправлять analytics до согласия;
- объединять health consent с обязательным onboarding;
- обещать deletion SLA, пока он не реализован операционно;
- копировать реальные персональные данные в support/telemetry.

Документ — инженерная спецификация, не финальная privacy policy. Перед публикацией counsel сверяет фактический traffic, subprocessors, hosting region, retention, age policy и store disclosures.
