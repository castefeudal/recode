# Data-flow map — 7.0.0

## Local by default

The canonical game state is stored in browser local storage or the platform save location. Journal text, food entries and sleep entries remain local. Export is user-initiated.

## Optional cloud flow

1. User explicitly enables game-data sync and supplies an owner-hosted HTTPS endpoint.
2. Credentials are sent to `/v1/auth/*`; access and refresh tokens are kept in session storage by the Web client.
3. `createCloudPayload()` builds an explicit allowlist. It excludes journal, food, sleep, API URL and tokens.
4. The API stores one versioned save per account and uses optimistic revision checks.
5. Export and deletion are authenticated user actions.

## Trust boundaries

- Browser/device ↔ owner-hosted API over TLS.
- API ↔ SQLite volume on a single-node deployment.
- Store/native SDKs are outside the verified source-only boundary until owner-gate evidence exists.
