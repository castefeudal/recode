#!/usr/bin/env python3
"""Creator Studio canonical roundtrip and adversarial validator tests."""
from __future__ import annotations

import json
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent
VALIDATOR = ROOT.parent / "validators" / "validate_campaign.py"
EXAMPLE = ROOT / "example_campaign.mmc"


class CreatorRoundtripTests(unittest.TestCase):
    def run_validator(self, payload: dict) -> subprocess.CompletedProcess[str]:
        with tempfile.NamedTemporaryFile("w", suffix=".mmc", encoding="utf-8", delete=False) as handle:
            json.dump(payload, handle, ensure_ascii=False, sort_keys=True)
            path = Path(handle.name)
        try:
            return subprocess.run(
                ["python3", str(VALIDATOR), str(path)],
                text=True,
                capture_output=True,
                timeout=10,
                check=False,
            )
        finally:
            path.unlink(missing_ok=True)

    def test_canonical_roundtrip(self):
        source = json.loads(EXAMPLE.read_text(encoding="utf-8"))
        canonical = json.dumps(source, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
        restored = json.loads(canonical)
        self.assertEqual(
            canonical,
            json.dumps(restored, ensure_ascii=False, sort_keys=True, separators=(",", ":")),
        )
        result = self.run_validator(restored)
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_rejects_duplicate_orphan_unsafe_and_xss(self):
        base = json.loads(EXAMPLE.read_text(encoding="utf-8"))
        cases = []

        duplicate = json.loads(json.dumps(base))
        duplicate["scenes"].append(json.loads(json.dumps(duplicate["scenes"][0])))
        cases.append(duplicate)

        orphan = json.loads(json.dumps(base))
        extra = json.loads(json.dumps(orphan["scenes"][0]))
        extra["id"] = "orphan_scene"
        for index, choice in enumerate(extra["choices"]):
            choice["id"] = f"orphan_choice_{index}"
        orphan["scenes"].append(extra)
        cases.append(orphan)

        unsafe = json.loads(json.dumps(base))
        unsafe["assets"] = [{"path": "../.env", "alt": {"ru": "x", "en": "x"}}]
        cases.append(unsafe)

        xss = json.loads(json.dumps(base))
        xss["scenes"][0]["text"]["en"] = "<script>alert(1)</script>"
        cases.append(xss)

        for payload in cases:
            with self.subTest(case=len(payload.get("scenes", []))):
                self.assertNotEqual(self.run_validator(payload).returncode, 0)


if __name__ == "__main__":
    unittest.main(verbosity=2)
