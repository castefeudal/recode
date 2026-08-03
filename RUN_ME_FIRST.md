# RUN ME FIRST — MARKOVMADE: RECODE 7.0.0

## Requirements

- Node 22.16.0 or compatible 22.x;
- Python 3.12+;
- npm registry access to every integrity-pinned lockfile tarball;
- Godot 4.6 for full verification and exports;
- Java/Android SDK for Android export; macOS/Xcode and owner credentials for Apple builds.

## Bootstrap and strict verification

```bash
bash scripts/bootstrap.sh
bash scripts/verify_all.sh
```

The command fails if backend dependencies, Web dependencies or Godot are unavailable. No mandatory component is silently skipped.

For source/content validation only:

```bash
bash scripts/verify_source.sh
```

## Development

```bash
cd web_app
npm run dev
```

Optional cloud API is disabled by default. To run it for local integration testing, use a test/development environment and explicitly enable cloud auth:

```bash
APP_ENV=development \
CLOUD_AUTH_ENABLED=1 \
JWT_SECRET='local-test-secret-with-at-least-32-bytes' \
SQLITE_PATH='./backend/recode-dev.db' \
backend/.venv/bin/python -m uvicorn app.main:app --app-dir backend --reload
```

Production refuses the default or a short JWT secret. Cloud registration must remain disabled until the owner has an approved verification/recovery perimeter.

## Release packaging

```bash
bash scripts/package_release.sh
```

Packaging first runs the strict full verification, then generates SBOM/provenance, tests every archive, verifies SHA-256, scans forbidden paths/basic secret patterns, extracts the source archive and reruns validators.

## External gates

Read `owner_gates/OWNER_GATE_MATRIX.md`. Signed builds, devices, store reviews, pentest, legal/clinical and human studies cannot be replaced by generated claims.
