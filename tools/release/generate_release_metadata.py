#!/usr/bin/env python3
"""Generate deterministic release SBOM and provenance manifests."""
from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
VERSION = (ROOT / "VERSION").read_text(encoding="utf-8").strip()
lock = json.loads((ROOT / "web_app/package-lock.json").read_text(encoding="utf-8"))
components = []
for key, meta in sorted(lock.get("packages", {}).items()):
    if not key.startswith("node_modules/") or not meta.get("version"):
        continue
    name = key.removeprefix("node_modules/")
    components.append({
        "type": "library",
        "name": name,
        "version": str(meta["version"]),
        "purl": f"pkg:npm/{name}@{meta['version']}",
    })
for line in (ROOT / "backend/requirements.txt").read_text(encoding="utf-8").splitlines():
    line = line.strip()
    if not line or line.startswith("#"):
        continue
    name, version = line.split("==", 1)
    components.append({
        "type": "library",
        "name": name,
        "version": version,
        "purl": f"pkg:pypi/{name}@{version}",
    })

sbom = {
    "bomFormat": "CycloneDX",
    "specVersion": "1.5",
    "serialNumber": f"urn:uuid:markovmade-recode-{VERSION.replace(chr(46), chr(45))}",
    "version": 1,
    "metadata": {
        "component": {
            "type": "application",
            "name": "MARKOVMADE: RECODE — Life RPG",
            "version": VERSION,
        }
    },
    "components": components,
}
(ROOT / "docs/SBOM.cdx.json").write_text(json.dumps(sbom, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

tracked = [
    "VERSION",
    "web_app/package-lock.json",
    "backend/requirements.txt",
    "game/narrative/season_01.json",
    "tools/content/rebuild_season.py",
    "art_source/generated/recode-meridian-hero-desktop-v6.png",
    "art_source/generated/recode-meridian-hero-mobile-v6.png",
    "art_source/generated/recode-meridian-cast-v6.png",
]
provenance = {
    "product": "MARKOVMADE: RECODE — Life RPG",
    "version": VERSION,
    "generated_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
    "authorship": "Original concept, system and authorship: Павел Марков / Pavel Markov / MARKOVMADE",
    "baseline_source_sha256": "326546923e0b442a09ac73d2680bf250cc9a3eeb54fe95983d34ae9c79eb4096",
    "materials": [
        {"path": path, "sha256": hashlib.sha256((ROOT / path).read_bytes()).hexdigest()}
        for path in tracked
    ],
    "claims": {
        "human_review_claimed": False,
        "signed_native_binaries_claimed": False,
        "production_web_deployment_claimed": False,
        "production_web_deployment_access": "owner-only",
        "exact_release_validation_required": True,
    },
}
(ROOT / "docs/PROVENANCE.json").write_text(json.dumps(provenance, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps({"sbom_components": len(components), "provenance_materials": len(tracked)}))
