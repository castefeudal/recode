# Deployment Field Guide

## Promotion model

`development → staging → release candidate → store review → production`

Каждый переход создаёт новый immutable artifact. Нельзя пересобирать тот же version tag с другими bytes.

## Preflight

1. Clean checkout.
2. Verify `VERSION`, changelog and source commit.
3. Run content generator only if reviewed blueprints changed.
4. Run validators and contract tests.
5. Build web and Godot targets.
6. Generate checksums and SBOM.
7. Sign platform artifacts.
8. Run clean-device smoke.
9. Archive symbols and mapping files.
10. Promote exact tested bytes.

## Environment variables

Production secrets live in CI secret manager. Minimum privilege: build job can read signing secret but cannot administer store; deployment job can upload artifact but cannot read source-level unrelated secrets.

No secret may appear in:

- `.env.example`;
- Godot resources;
- VDF committed templates;
- client JavaScript bundle;
- crash log;
- screenshot;
- support export.

## Windows

Output: versioned directory containing executable and `.pck`.

Checks:

- Windows 10/11;
- standard and non-ASCII username;
- no admin requirement;
- DPI 100/150/200%;
- offline first boot;
- antivirus scan;
- code signature timestamp valid;
- uninstall preserves/clears save according to explicit option.

## Linux and Steam Deck

- x86_64 export;
- executable bit retained;
- libraries resolve on clean Ubuntu LTS;
- Wayland/X11 input;
- 1280×800 layout;
- controller-only onboarding;
- on-screen keyboard for name input;
- suspend/resume;
- 40 fps energy profile;
- Proton build tested even if native Linux is offered.

## macOS

- Universal if dependencies support arm64+x86_64;
- sign nested code;
- hardened runtime;
- entitlements minimal;
- notarize and staple;
- Gatekeeper test on clean machine;
- save path and sandbox policy verified.

## Android

- release AAB;
- target SDK per current Play requirement at release date;
- min SDK documented;
- arm64-v8a required;
- signing key backed up offline;
- Health Connect permission screen separate from game onboarding;
- Data Safety matches packet capture;
- internal track → closed test → production staged rollout;
- crash/ANR vitals gate.

## iOS/iPadOS

- Xcode archive from exported project;
- automatic/manual signing policy recorded;
- privacy manifest updated;
- HealthKit purpose strings specific;
- App Privacy labels from data map;
- TestFlight external review;
- iPhone/iPad safe areas and Dynamic Type;
- background behavior does not fabricate completion.

## Steam

- real App ID/depot IDs injected in secure pipeline;
- beta branch first;
- achievements initialized after API ready;
- Cloud conflict UI tested;
- controller glyphs and Deck keyboard;
- store capsules built from approved local art;
- no build password in repository;
- rollback depot retained.

## Web/PWA vertical

Hosted Web/PWA — самостоятельный полностью проходимый offline-first product vertical. Он не заменяет неподтверждённые native/store builds.

Gates:

- lint and production build;
- no runtime secrets in bundle;
- localStorage deletion works;
- no analytics without consent;
- responsive 390/768/1440;
- image compression;
- keyboard focus and reduced motion;
- privacy statement matches actual traffic.

## Rollback

Rollback criteria:

- crash-free sessions below agreed SLO;
- save corruption;
- inability to delete data;
- store receipt regression;
- unsafe health recommendation;
- scene graph dead-end affecting >1%.

Rollback artifact must be previously tested and schema-compatible. If a new save schema cannot be read by old version, rollback requires forward-compatible hotfix instead of binary downgrade.

## Release record

For each platform store:

- semantic version/build number;
- source commit;
- content schema hash;
- save schema;
- toolchain versions;
- artifact SHA-256;
- signing identity fingerprint;
- test report;
- known issues;
- rollout percentage;
- approver and timestamp.
