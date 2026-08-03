# Threat model — 7.0.0

| Threat | Control | Remaining limitation |
|---|---|---|
| Default/weak signing secret | Production startup guard requires 32+ bytes | Owner must rotate/store secret securely |
| Token forgery/replay | HS256 JWT claims, constant-time signature check, short access lifetime, refresh rotation and revocation | No external identity provider; email verification/recovery not enabled |
| Concurrent save overwrite | `BEGIN IMMEDIATE` and expected revision conflict | Client merge UX still needs browser E2E evidence |
| Oversized payload/DoS | Content-length and serialized payload limits, per-IP limiter | Limiter is process-local; multi-replica deployment needs shared gateway/Redis |
| Sensitive local data upload | Explicit client-side allowlist | Independent privacy review remains external |
| Database loss | WAL, backup/restore tooling and volume guidance | Managed redundant database is not implemented |
| Supply-chain compromise | lockfiles, pinned Python dependencies, SBOM/provenance generation | External vulnerability feeds/scanners require connected CI |
| Native permission abuse | capability checks and explicit unavailable states | Physical-device review remains external |
