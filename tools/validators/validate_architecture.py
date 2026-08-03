#!/usr/bin/env python3
"""Small enforceable architecture guard for the Web vertical slice."""
from pathlib import Path
import json
ROOT = Path(__file__).resolve().parents[2]
page = (ROOT / "web_app/app/page.tsx").read_text(encoding="utf-8")
cloud = ROOT / "web_app/app/infrastructure/cloud-api.ts"
storage = ROOT / "web_app/app/infrastructure/save-storage.ts"
panel = ROOT / "web_app/app/components/CloudPanel.tsx"
checks = {
    "cloud adapter extracted": cloud.is_file(),
    "storage adapter extracted": storage.is_file(),
    "cloud component extracted": panel.is_file(),
    "page does not parse API error envelopes": "server_revision" not in page and "access_token" not in page,
    "page does not own storage keys": "markovmade-recode-v6" not in page,
    "privacy allowlist documented": cloud.is_file() and "Explicit allowlist" in cloud.read_text(encoding="utf-8"),
}
errors = [name for name, passed in checks.items() if not passed]
print(json.dumps({"status": "passed" if not errors else "failed", "checks": checks, "errors": errors}, indent=2))
raise SystemExit(1 if errors else 0)
