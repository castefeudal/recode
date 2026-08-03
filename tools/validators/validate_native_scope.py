#!/usr/bin/env python3
from pathlib import Path
import json, re
ROOT = Path(__file__).resolve().parents[2]
providers = {
    name: (ROOT / f"game/providers/{name}.gd").read_text(encoding="utf-8")
    for name in ["IOSHealthKitProvider", "AndroidHealthConnectProvider", "DesktopCloudSyncProvider", "ManualHealthProvider", "MockHealthProvider"]
}
checks = {
    "iOS capability check": 'Engine.has_singleton(SINGLETON)' in providers["IOSHealthKitProvider"],
    "Android capability check": 'Engine.has_singleton(SINGLETON)' in providers["AndroidHealthConnectProvider"],
    "desktop health cloud adapter disabled": 'func is_available() -> bool: return false' in providers["DesktopCloudSyncProvider"],
    "mock restricted to debug/editor": 'OS.is_debug_build()' in providers["MockHealthProvider"],
    "manual provider remains available": 'func is_available() -> bool: return true' in providers["ManualHealthProvider"],
    "no unconditional native availability": not any(re.search(r'func is_available\(\) -> bool:\s*return true', providers[name]) for name in ["IOSHealthKitProvider", "AndroidHealthConnectProvider"]),
}
errors=[name for name,ok in checks.items() if not ok]
print(json.dumps({"status":"passed" if not errors else "failed","checks":checks,"errors":errors},indent=2))
raise SystemExit(1 if errors else 0)
