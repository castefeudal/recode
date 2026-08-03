# Known Limitations and Owner Gates

The following items are intentionally not marked PASS without runtime evidence:

1. Clean `npm ci` from a working package registry.
2. Production Web build and bundle-size comparison.
3. Playwright interaction and visual-regression suite against the compiled application.
4. axe scan with zero critical/serious violations.
5. Lighthouse and measured LCP/CLS/INP.
6. Keyboard-only and screen-reader human verification.
7. 200% zoom and browser matrix.
8. Full light-theme screenshot matrix for every route.
9. iOS/Android physical-device safe-area and virtual-keyboard checks.
10. Godot/native parity implementation for the new Web design language.

The available dependency registry returned a missing locked artifact during installation. This is recorded as an environment/registry blocker rather than converted into a false visual or production PASS.
