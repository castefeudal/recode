# Owner-gate matrix

These rows are deliberately not marked PASS without external evidence.

| Gate | Required input | Procedure | PASS evidence |
|---|---|---|---|
| Apple signing/store | Developer account, certificates, profiles, App Store Connect record | Follow `docs/IOS_RELEASE.md`; build on clean macOS runner; upload to TestFlight | signed artifact hash, build log, TestFlight processing result |
| Google Play signing/store | Play account, keystore, service credentials | Follow `docs/ANDROID_RELEASE.md`; internal-track upload | signed AAB hash and Play Console result |
| Steam | App ID, depot credentials | Follow `docs/STEAM_RELEASE.md`; upload private branch | SteamPipe log and install smoke report |
| Physical devices | Supported iOS/Android hardware | Run permissions/read/write/revoke/offline scenarios | device matrix with OS/build IDs and raw logs |
| External pentest | Deployed staging URL and test accounts | OWASP API/Web scope, authenticated and unauthenticated | final report with zero unaccepted critical/high findings |
| Legal/clinical | Final policies, data map, health copy | Qualified counsel/clinical reviewer signs scoped review | signed review and issue disposition |
| Accessibility users | Keyboard, screen-reader and low-vision participants | Execute critical journeys | anonymized findings and resolved critical blockers |
| Blind playtest | Representative new users | Observe first-session core loop without coaching | protocol, recordings/notes, comprehension result |
| Store review | Final signed builds and metadata | Submit to stores | approval or documented remediation closure |
