#!/usr/bin/env python3
"""Validate all current-release version declarations against root VERSION."""
from __future__ import annotations
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
VERSION = (ROOT / "VERSION").read_text(encoding="utf-8").strip()
checks = {
    "web package": f'"version": "{VERSION}"' in (ROOT / "web_app/package.json").read_text(encoding="utf-8"),
    "godot runtime": f'config/version="{VERSION}"' in (ROOT / "game/project.godot").read_text(encoding="utf-8"),
    "backend runtime": f'APP_VERSION = "{VERSION}"' in (ROOT / "backend/app/main.py").read_text(encoding="utf-8"),
    "sbom": json.loads((ROOT / "docs/SBOM.cdx.json").read_text(encoding="utf-8"))["metadata"]["component"]["version"] == VERSION,
    "provenance": json.loads((ROOT / "docs/PROVENANCE.json").read_text(encoding="utf-8"))["version"] == VERSION,
    "readme": VERSION in (ROOT / "README.md").read_text(encoding="utf-8"),
    "runbook": VERSION in (ROOT / "RUN_ME_FIRST.md").read_text(encoding="utf-8"),
    "release notes": VERSION in (ROOT / "RELEASE_NOTES.md").read_text(encoding="utf-8"),
    "delivery manifest": VERSION in (ROOT / "DELIVERY_MANIFEST.md").read_text(encoding="utf-8"),
}
errors = [name for name, passed in checks.items() if not passed]
print(json.dumps({"version": VERSION, "status": "passed" if not errors else "failed", "checks": checks, "errors": errors}, ensure_ascii=False, indent=2))
raise SystemExit(1 if errors else 0)
