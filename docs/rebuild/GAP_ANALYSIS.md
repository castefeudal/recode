# Canonical rebuild — gap analysis

## Resolved in this rebuild

1. **Visual source gap:** current main used V6/V7 art while Source B supplied the newer Meridian Noir 2.0 V10 hero/origins/city visuals. The V10 optimized assets are added to the web runtime and their source PNGs remain under `art_source`.
2. **PWA asset contract:** current service worker listed the V7 shell only. The cache manifest is extended with V10 key art and uses the registration scope for `/recode`-safe URLs.
3. **Origin identity:** the existing origin selector had the correct functional differences but lacked the V10 visual identity. The selector now uses the V10 four-quadrant art treatment while retaining stats, tension and save behavior.
4. **Deployment evidence:** rebuild-specific inventory, decisions, QA and deployment records are kept under `docs/rebuild` so current historical evidence is not overwritten.

## Existing current-main strengths retained

- Full content datasets and current hashes.
- GameState schema 6, migrations, backup recovery, import/export and local-first privacy boundary.
- Daily Command, narrative, quests, body, nutrition, recovery, mind, relations, work, Meridian and profile surfaces.
- Typed SVG icon system, semantic themes, high contrast, reduced motion, keyboard/focus primitives and responsive navigation.
- Training builder/session, recovery and progress product slices outside the legacy narrative shell.
- CI, source validators, backend tests, provenance, legal files and native/Godot source.

## Remaining limitations to report honestly

- The local environment may not provide a browser automation lab or Lighthouse; those are not marked PASS without execution.
- The current shell still contains a large legacy presentation module; domain logic is already separated, but a future low-risk decomposition can split remaining view sections.
- Audio is not enabled in the web runtime. This is intentional until an explicit user-controlled audio UX, volume persistence and reduced-sensory QA are implemented.
- GitHub Pages deployment status depends on the repository Actions runner after the branch is published.

