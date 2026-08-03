# Performance report — 7.0.0

## Measured static evidence

- primary page JavaScript: **23,176 B gzip**; gate <150,000 B;
- desktop hero AVIF: **43,242 B**;
- mobile hero AVIF: **55,942 B**;
- cast AVIF: **33,396 B**;
- canonical 1.2 MB season and 3.2 MB exercise catalog are outside the initial
  page module graph and loaded as content;
- production output: about **16 MB**, including offline content and PNG
  compatibility fallbacks;
- production build and artifact validation pass.

## Interpretation

The first visual path is deliberately small even though the installable product
ships a large offline catalog. Responsive formats prevent the 1.8–2.7 MB PNG
fallbacks from being the normal modern-browser request.

## Not measured here

Lighthouse/CWV, slow-4G trace, low-memory Android, cache-warm/cold timing,
service-worker install cost and long-task profile. These require a repeatable
browser lab and cannot be inferred from bundle bytes.
