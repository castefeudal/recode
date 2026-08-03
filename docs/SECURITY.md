# Security

## Threat model

Основные угрозы: XSS/import injection, malicious `.mmc`, path traversal, token theft, credential stuffing, save overwrite/conflict, excessive requests, secret leakage и непреднамеренная отправка journal/health text.

## Реализованные меры

- Web рендерит React text nodes и не использует `dangerouslySetInnerHTML`.
- Save import проверяет структуру/schema и мигрирует известные версии; primary имеет backup.
- Creator validator отклоняет absolute/`..` paths, dangling links, orphan scenes и подозрительные script/javascript strings.
- API ограничивает Pydantic fields, использует parameterized SQLite, scrypt password hashing, constant-time HMAC compare и короткий access token.
- Refresh tokens хранятся как SHA-256 hashes, ротируются и могут быть revoked через logout.
- Save write использует `expected_revision`; конфликт возвращает structured 409.
- Ответы API получают `no-store`, `nosniff`, `no-referrer`, restrictive Permissions-Policy и per-IP rate limit.
- Client tokens остаются в `sessionStorage`; journal/food/sleep удаляются из cloud payload.
- `.env`, keys, certificates и credentials исключаются из release archives.

## Production gates

1. Сгенерировать `JWT_SECRET` ≥48 random bytes в secret manager.
2. TLS only, exact `CORS_ORIGINS`, docs off.
3. Encrypted database backup и tested restore.
4. Reverse-proxy body/rate limits и account abuse controls.
5. Dependency/SBOM scan, SAST, DAST, pentest и log-redaction test.
6. Rotation/revocation incident drill.
7. Не логировать save payload, email, journal или health records.

Этот source не заявляется как прошедший независимый pentest.
