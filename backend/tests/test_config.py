"""Stdlib-only verification of the production configuration guard."""
from pathlib import Path
import ast
import unittest


class BackendConfigTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.path = Path(__file__).parents[1] / "app/main.py"
        cls.text = cls.path.read_text(encoding="utf-8")
        cls.tree = ast.parse(cls.text)

    def test_source_compiles_and_defines_production_guard(self):
        names = {node.name for node in self.tree.body if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))}
        self.assertIn("validate_runtime_config", names)
        self.assertIn('if APP_ENV == "production":', self.text)
        self.assertIn("len(SECRET.encode(\"utf-8\")) < 32", self.text)
        self.assertIn("raise RuntimeError", self.text)

    def test_version_is_current(self):
        self.assertIn('APP_VERSION = "7.0.0"', self.text)


if __name__ == "__main__":
    unittest.main()
