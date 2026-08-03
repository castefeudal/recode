#!/usr/bin/env python3
"""Synchronize current-release declarations from the canonical root VERSION."""
from __future__ import annotations
import json, re
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
version = (ROOT / "VERSION").read_text(encoding="utf-8").strip()
if not re.fullmatch(r"\d+\.\d+\.\d+", version):
    raise SystemExit("VERSION must be semantic x.y.z")
replacements = {
    "game/project.godot": [(r'config/version="[^"]+"', f'config/version="{version}"')],
    "backend/app/main.py": [(r'APP_VERSION = "[^"]+"', f'APP_VERSION = "{version}"')],
}
for rel, rules in replacements.items():
    path = ROOT / rel
    text = path.read_text(encoding="utf-8")
    for pattern, replacement in rules:
        text = re.sub(pattern, replacement, text)
    path.write_text(text, encoding="utf-8")
package_path = ROOT / "web_app/package.json"
package = json.loads(package_path.read_text(encoding="utf-8")); package["version"] = version
package_path.write_text(json.dumps(package, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps({"version": version, "updated": sorted(replacements) + ["web_app/package.json"]}))
