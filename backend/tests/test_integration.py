"""Black-box API lifecycle test against a real local Uvicorn process."""
from __future__ import annotations

import json
import os
import socket
import sys
import subprocess
import tempfile
import time
import unittest
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[1]


class BackendIntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        sock = socket.socket()
        sock.bind(("127.0.0.1", 0))
        cls.port = sock.getsockname()[1]
        sock.close()
        cls.tempdir = tempfile.TemporaryDirectory(prefix="recode-api-test-")
        env = os.environ.copy()
        env.update({
            "JWT_SECRET": "integration-test-secret-that-is-long-and-never-deployed",
            "SQLITE_PATH": str(Path(cls.tempdir.name) / "test.db"),
            "RATE_LIMIT_PER_MINUTE": "500",
            "CORS_ORIGINS": "https://game.example",
            "ENABLE_DOCS": "0",
            "APP_ENV": "test",
            "CLOUD_AUTH_ENABLED": "1",
        })
        cls.process = subprocess.Popen(
            [
                sys.executable, "-m", "uvicorn",
                "app.main:app", "--host", "127.0.0.1", "--port", str(cls.port),
                "--log-level", "warning",
            ],
            cwd=BACKEND,
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
        )
        for _ in range(80):
            try:
                status, _, _ = cls.request("GET", "/health")
                if status == 200:
                    break
            except OSError:
                pass
            time.sleep(0.1)
        else:
            output = cls.process.stdout.read() if cls.process.stdout else ""
            raise RuntimeError(f"API did not start: {output}")

    @classmethod
    def tearDownClass(cls) -> None:
        cls.process.terminate()
        try:
            cls.process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            cls.process.kill()
        cls.tempdir.cleanup()

    @classmethod
    def request(cls, method: str, path: str, body=None, token=None, origin=None):
        headers = {"Content-Type": "application/json"}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        if origin:
            headers["Origin"] = origin
        request = urllib.request.Request(
            f"http://127.0.0.1:{cls.port}{path}",
            data=json.dumps(body).encode() if body is not None else None,
            headers=headers,
            method=method,
        )
        try:
            with urllib.request.urlopen(request, timeout=8) as response:
                raw = response.read()
                return response.status, dict(response.headers), json.loads(raw) if raw else None
        except urllib.error.HTTPError as error:
            raw = error.read()
            return error.code, dict(error.headers), json.loads(raw) if raw else None

    def test_complete_account_and_save_lifecycle(self):
        status, headers, health = self.request("GET", "/health", origin="https://game.example")
        headers = {key.lower(): value for key, value in headers.items()}
        self.assertEqual(status, 200)
        self.assertEqual(health["version"], "7.0.0")
        self.assertTrue(health["production_secret_configured"])
        self.assertEqual(headers["cache-control"], "no-store")
        self.assertEqual(headers["x-content-type-options"], "nosniff")
        self.assertEqual(headers["access-control-allow-origin"], "https://game.example")

        status, _, readiness = self.request("GET", "/ready")
        self.assertEqual((status, readiness["status"]), (200, "ready"))

        credentials = {"email": "qa@example.test", "password": "correct-horse-2026"}
        status, _, tokens = self.request("POST", "/v1/auth/register", credentials)
        self.assertEqual(status, 201)
        access = tokens["access_token"]
        refresh = tokens["refresh_token"]

        status, _, sessions = self.request("GET", "/v1/auth/sessions", token=access)
        self.assertEqual(status, 200)
        self.assertEqual(len(sessions["sessions"]), 1)

        status, _, duplicate = self.request("POST", "/v1/auth/register", credentials)
        self.assertEqual(status, 409)
        self.assertEqual(duplicate["error"]["code"], "account_exists")

        status, _, save = self.request(
            "PUT", "/v1/save",
            {"schema_version": 6, "expected_revision": 0, "payload": {"day": 7, "journal": []}},
            access,
        )
        self.assertEqual((status, save["revision"]), (200, 1))

        status, _, conflict = self.request(
            "PUT", "/v1/save",
            {"schema_version": 6, "expected_revision": 0, "payload": {"day": 8}},
            access,
        )
        self.assertEqual(status, 409)
        self.assertEqual(conflict["error"], {"code": "save_conflict", "server_revision": 1})

        status, _, oversized = self.request(
            "PUT", "/v1/save",
            {"schema_version": 6, "expected_revision": 1, "payload": {"blob": "x" * 1_100_000}},
            access,
        )
        self.assertEqual(status, 413)
        self.assertEqual(oversized["error"]["code"], "payload_too_large")

        def writer(day: int):
            return self.request(
                "PUT", "/v1/save",
                {"schema_version": 6, "expected_revision": 1, "payload": {"day": day}},
                access,
            )

        with ThreadPoolExecutor(max_workers=2) as pool:
            writes = list(pool.map(writer, (8, 9)))
        self.assertEqual(sorted(item[0] for item in writes), [200, 409])
        successful = next(item for item in writes if item[0] == 200)
        self.assertEqual(successful[2]["revision"], 2)

        status, _, saved = self.request("GET", "/v1/save", token=access)
        self.assertEqual(status, 200)
        self.assertIn(saved["save"]["payload"]["day"], {8, 9})

        status, _, export = self.request("GET", "/v1/data/export", token=access)
        self.assertEqual(status, 200)
        self.assertEqual(export["save"]["revision"], 2)

        status, _, rotated = self.request("POST", "/v1/auth/refresh", {"refresh_token": refresh})
        self.assertEqual(status, 200)
        status, _, revoked = self.request("POST", "/v1/auth/refresh", {"refresh_token": refresh})
        self.assertEqual(status, 401)
        self.assertEqual(revoked["error"]["code"], "refresh_revoked")

        status, _, mentor = self.request(
            "POST", "/v1/mentor", {"state": "returning", "minutes_available": 5},
            rotated["access_token"],
        )
        self.assertEqual(status, 200)
        self.assertFalse(mentor["medical_advice"])

        status, _, deleted = self.request("DELETE", "/v1/data", token=rotated["access_token"])
        self.assertEqual((status, deleted["status"]), (200, "deleted"))
        status, _, login = self.request("POST", "/v1/auth/login", credentials)
        self.assertEqual(status, 401)
        self.assertEqual(login["error"]["code"], "invalid_credentials")

    def test_zz_concurrent_health_load(self):
        def sample(_index: int):
            started = time.perf_counter()
            status, _, _ = self.request("GET", "/health")
            return status, (time.perf_counter() - started) * 1000

        with ThreadPoolExecutor(max_workers=20) as pool:
            samples = list(pool.map(sample, range(100)))
        statuses = [status for status, _ in samples]
        timings = sorted(duration for _, duration in samples)
        p95_ms = timings[int(len(timings) * .95) - 1]
        self.assertEqual(statuses.count(200), 100)
        self.assertLess(p95_ms, 500)


if __name__ == "__main__":
    unittest.main(verbosity=2)
