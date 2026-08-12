# Performance report — canonical rebuild

## Evidence available

- Full narrative and exercise datasets remain static content, not embedded in the initial page chunk.
- Exercise data is fetched only by the Body feature.
- Existing bundle-budget test passed during `npm test`.
- Pages export includes optimized V10 WebP assets: hero 51 KB, origins 107 KB, Meridian city 199 KB.
- Existing V6/V7 AVIF/WebP budgets and asset integrity tests passed.
- Static export uses pre-sized image containers and the existing responsive design system.

## Not measured

Lighthouse/Core Web Vitals and long-task traces were not run because no Lighthouse/browser performance lab was available in this environment. Targets such as Performance ≥90 and LCP/CLS thresholds remain targets, not PASS claims.

