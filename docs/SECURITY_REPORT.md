# Security report — 7.0.0

## Passed controls

- no secrets or `.env` files are intended for archives;
- Web save is local-first and explicit consent is required;
- future save schema is rejected without overwriting current data;
- backend uses scrypt, expiring/rotating tokens, payload/rate limits and
  optimistic revision conflict;
- backend 3/3 tests and `pip check` pass;
- Creator validator blocks scripts, `javascript:`, traversal and oversized
  campaigns;
- runtime has no remote image hotlinks.

## Dependency finding

`npm audit --omit=dev` reports 3 high vulnerability groups in the current
Next.js dependency tree: Next.js plus transitive PostCSS and Sharp. Next is at
the newest tested stable 16.2.12. The deployed Vinext Worker does not use
Server Actions, rewrites, remote image optimization or user-provided CSS, which
reduces the relevant surface; the audit is still OPEN, not waived.

## Production owner gate

Recheck advisories on every release; update when an audit-clean compatible
stable exists. Before enabling cloud accounts, add TLS/WAF, managed secrets,
backups, centralized logs, alerting, external rate limiting, DAST, dependency
scanning and an independent pentest. Do not reuse development JWT secrets.
