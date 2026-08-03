# Delivery manifest — 7.0.0

All files are generated from the validated 7.0.0 workspace. Archives exclude
`node_modules`, virtual environments, caches, `.git`, `.env`, logs and secrets.
The SOURCE archive was also extracted into a new temporary directory and passed
fresh `npm ci`, typecheck, lint, build, 6/6 tests and artifact validation.

| File | Purpose |
|---|---|
| `MARKOVMADE_RECODE_7.0.0_SOURCE.zip` | Complete editable product, tests, docs and release scripts |
| `MARKOVMADE_RECODE_7.0.0_WEB_BUILD.tar.gz` | Exact validated production Worker artifact and static assets |
| `MARKOVMADE_RECODE_7.0.0_CONTENT_CREATOR_KIT.zip` | Creator Studio, builders, schemas and narrative validators |
| `MARKOVMADE_RECODE_7.0.0_PLATFORM_RELEASE_KIT.zip` | Godot/backend/native/store/Steam sources and runbooks |
| `MARKOVMADE_RECODE_7.0.0_DOCUMENTATION.zip` | Product, engineering, legal, QA, SBOM and provenance |
| `MARKOVMADE_RECODE_7.0.0_QA_EVIDENCE.zip` | Tests, raw simulations, scorecards and reports |
| `MARKOVMADE_RECODE_7.0.0_MEDIA_KIT.zip` | Key-art sources, runtime derivatives, icons, social card and prompts |
| `MARKOVMADE_RECODE_7.0.0_SHA256SUMS.txt` | SHA-256 for all seven archives |

Verify:

```bash
sha256sum -c MARKOVMADE_RECODE_7.0.0_SHA256SUMS.txt
unzip -t MARKOVMADE_RECODE_7.0.0_SOURCE.zip
unzip -t MARKOVMADE_RECODE_7.0.0_MEDIA_KIT.zip
tar -tzf MARKOVMADE_RECODE_7.0.0_WEB_BUILD.tar.gz >/dev/null
```

Start with `SOURCE.zip` → `RUN_ME_FIRST.md`. Use `WEB_BUILD.tar.gz` only for a
compatible Worker host; use the source checkout for ChatGPT Sites lifecycle.
