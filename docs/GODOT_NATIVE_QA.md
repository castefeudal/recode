# Godot and native QA

Godot 4.6, export templates, Android SDK, Xcode, signing certificates and store
accounts were unavailable. Status is **SOURCE PREPARED / RUNTIME SKIPPED**.

Verified in this environment:

- `game/project.godot` exists and reports version 7.0.0.
- Narrative/data references pass the cross-project Python validator.
- Export presets and platform release instructions are packaged.
- Native plugin source and health-integration documentation are retained.

Required owner gates:

```bash
godot --headless --path game --editor --quit
godot --headless --path game --quit
./scripts/build_all.sh
```

Then execute parity scenarios for onboarding, Today, Story, delayed
consequences, RU/EN, save v6 and controller navigation at 1280×720,
1920×1080 and Steam Deck. Platform archives must be signed and smoke-tested on
real devices before any store-ready claim.
