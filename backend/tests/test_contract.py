import pathlib
import unittest


class BackendContractTests(unittest.TestCase):
    def setUp(self):
        self.text = (pathlib.Path(__file__).parents[1] / "app/main.py").read_text(encoding="utf-8")

    def test_routes_and_security_contract(self):
        for route in [
            "/health", "/ready", "/metrics", "/v1/auth/register", "/v1/auth/login",
            "/v1/auth/refresh", "/v1/auth/logout", "/v1/auth/sessions",
            "/v1/auth/logout-all", "/v1/save", "/v1/data", "/v1/data/export", "/v1/mentor",
        ]:
            self.assertIn(route, self.text)
        for required in [
            "validate_runtime_config", "DEFAULT_SECRET", "compare_digest", "scrypt",
            '"alg": "HS256"', "save_conflict", "structured_http_error",
            "Permissions-Policy", "X-Request-ID", "BEGIN IMMEDIATE", "busy_timeout",
        ]:
            self.assertIn(required, self.text)
        self.assertNotIn("sk-" + "", self.text)
        self.assertIn('APP_VERSION = "7.0.0"', self.text)

    def test_cloud_is_opt_in_and_sensitive_fields_are_not_server_contract(self):
        self.assertIn('CLOUD_AUTH_ENABLED = os.environ.get("CLOUD_AUTH_ENABLED", "0") == "1"', self.text)
        for sensitive in ["foodEntries", "sleepEntries", '"journal"']:
            self.assertNotIn(sensitive, self.text)


if __name__ == "__main__":
    unittest.main()
