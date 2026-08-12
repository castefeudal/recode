# Canonical rebuild — source inventory

Assessment date: 2026-08-12  
Target repository: `castefeudal/recode`  
Baseline main: `2535d75ac48ded9a734456343eea64ba4ee3bbf5`

## Inputs

| Source | Local reference | Files | Approx. archive tree size | Role |
|---|---|---:|---:|---|
| A / 7.0 Complete Source | `../sources/source-a` | 660 | 54 MB | canonical game, narrative, backend, native and documentation foundation |
| B / 10.0 GitHub Pages | `../sources/source-b` | 58 | 15 MB | newer web visual direction, static export, PWA and deployment reference |
| C / current GitHub main | `current` checkout | 826 tracked | 65.7 MB | deployment target plus later product/design/save improvements |

## Current main structure

Current main already contains the Source A foundation plus later additions: `web_app`, `game`, `backend`, `docs`, `legal`, `native_plugins`, `store`, `steamworks`, `art_source`, `scripts`, `tools`, `evidence`, `owner_gates` and deployment workflows. It is therefore retained as the merge base.

## Asset inventory

- Source A: generated hero/cast/character assets, Meridian map/world-state assets, Godot story/space assets and 6 music tracks plus 30 SFX WAV files.
- Source B: `recode-hero-v10`, `recode-origins-v10`, `recode-meridian-city-v10` source PNGs and optimized WebP runtime assets, plus the same cast/portrait set.
- Current main: V6/V7 responsive hero, cast, story, today, Meridian and character WebP/AVIF assets; current runtime references resolve to files already present on main.

## Runtime/content checks

The three sources contain the same web content payload hashes for the core datasets. Source A and current main additionally contain native/game-side datasets and supporting schemas not present in Source B.

| Dataset | Source A | Source B web | Current main | Decision |
|---|---:|---:|---:|---|
| chapters | 14 | 14 | 14 | preserve current + A canonical data |
| scenes | 140 | 140 | 140 | preserve full narrative |
| choices | 420 | 420 | 420 | preserve full choice graph |
| delayed consequences | 70 | 70 | 70 | preserve delayed system |
| ending rules | 8 | 8 | 8 | preserve all endings |
| quests | 275 | 275 | 275 | load as feature content |
| events | 160 | 160 | 160 | load as feature content |
| exercises | 1,324 | 1,324 | 1,324 | load lazily; never inline in initial route |
| characters | 8 | 8 | 8 | preserve portraits and relationship data |
| origins | 4 | implicit in app/game | 4 | preserve distinct origin stats and narrative gates |
| classes | 5 | implicit in app/game | 5 | preserve game-side class data |
| achievements | 20 | not in web archive | 20 | preserve game-side data |
| rooms | 10 | not in web archive | 10 | preserve Meridian source data |

## Licenses and provenance

`LICENSE`, `ASSET_LICENSES.md`, `THIRD_PARTY_NOTICES.md` and `docs/PROVENANCE.json` are present in Source A/current main. No external copyrighted asset is introduced by this rebuild. New V10 visuals are project-provided generated assets from Source B and are recorded in the merge matrix.

