# Creator Studio QA

## Verified

- Schema version 2 is present.
- `example_campaign.mmc` passes `validate_campaign.py`.
- Import normalizes scenes without executing imported content.
- Export emits `.mmc`-compatible JSON.
- Validator checks IDs, bilingual fields, choice references, reachability and
  safe asset paths.
- Undo/redo, autosave, duplication, ordering and live preview are implemented.

## Status

Static/schema acceptance: **PASS**.  
Browser import→edit→export→re-import roundtrip: **SKIPPED** because the browser
preview connection was unavailable.

## Required E2E

1. Serve `tools/creator_studio` on a local HTTP server.
2. Import `example_campaign.mmc`.
3. Change RU/EN title and one scene dialogue.
4. Duplicate a scene, repair its ID/link and run validation.
5. Export, re-import in a new session and compare canonical JSON.
6. Run `python3 tools/validators/validate_campaign.py <exported-file>`.
7. Verify an invalid duplicate ID, unreachable scene and unsafe asset path are
   rejected with specific messages.

Do not score Creator Studio ≥9.5 until this browser roundtrip is recorded.
