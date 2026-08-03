#!/usr/bin/env python3
"""Source-only visual design gate. It does not replace browser, axe or Lighthouse tests."""
from __future__ import annotations
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WEB = ROOT / "web_app"
DS = WEB / "app" / "design-system"

checks: list[dict[str, object]] = []
def check(name: str, condition: bool, detail: str) -> None:
    checks.append({"name": name, "status": "PASS" if condition else "FAIL", "detail": detail})

globals_css = (WEB / "app" / "globals.css").read_text(encoding="utf-8")
tokens = (DS / "tokens.css").read_text(encoding="utf-8")
base = (DS / "base.css").read_text(encoding="utf-8")
visual = (DS / "visual-upgrade.css").read_text(encoding="utf-8")
components = (DS / "components.tsx").read_text(encoding="utf-8")
icons = (DS / "Icon.tsx").read_text(encoding="utf-8")

layers = ["tokens.css", "base.css", "legacy.css", "visual-upgrade.css"]
positions = [globals_css.find(item) for item in layers]
check("css_layer_order", all(pos >= 0 for pos in positions) and positions == sorted(positions), str(dict(zip(layers, positions))))

required_tokens = ["--color-canvas", "--color-surface-1", "--color-text-primary", "--color-brand", "--color-focus", "--color-success", "--color-warning", "--color-danger", "--font-display", "--font-editorial", "--space-12", "--radius-xl", "--duration-base", "--z-dialog"]
missing_tokens = [item for item in required_tokens if item not in tokens]
check("semantic_tokens", not missing_tokens, f"missing={missing_tokens}; declarations={tokens.count('--')}")
check("themes", '[data-theme="dark"]' in tokens and '[data-theme="light"]' in tokens and '[data-contrast="high"]' in tokens, "dark/light/high-contrast selectors")
check("accessibility_foundations", all(item in base + visual for item in [":focus-visible", "prefers-reduced-motion", "prefers-contrast", "safe-area-inset-bottom", "44px"]), "focus, motion, contrast, safe area, target size")

required_components = ["Button", "IconButton", "Field", "TextAreaField", "SelectField", "CheckboxField", "RadioGroup", "Switch", "SliderField", "Tabs", "SegmentedControl", "Tooltip", "Popover", "DialogFrame", "Sheet", "ToastMessage", "Alert", "Badge", "ProgressBar", "Skeleton", "EmptyState", "Avatar", "ResponsiveImage", "NarrativeCard", "StatBlock", "Timeline", "Choice", "AppHeader", "AppFooter"]
missing_components = [name for name in required_components if f"function {name}" not in components]
check("component_inventory", not missing_components, f"missing={missing_components}; required={len(required_components)}")
check("typed_icon_system", "export type IconName" in icons and 'role={title ? "img"' in icons and len(icons.splitlines()) >= 40, f"lines={len(icons.splitlines())}")

css_text = (tokens + base + visual).replace("http://www.w3.org/2000/svg", "")
check("portable_design_css", "http://" not in css_text and "https://" not in css_text and "/mnt/data" not in css_text, "no external network or sandbox-specific design URLs")
check("balanced_css", all(text.count("{") == text.count("}") for text in [tokens, base, visual]), "brace balance for authored design layers")

required_docs = ["VISUAL_DIRECTION.md", "DESIGN_SYSTEM.md", "COMPONENT_INVENTORY.md", "MOTION_SYSTEM.md", "ACCESSIBILITY_REPORT.md", "VISUAL_QA_REPORT.md", "ASSET_AUDIT.md", "BEFORE_AFTER.md", "KNOWN_LIMITATIONS.md"]
missing_docs = [name for name in required_docs if not (ROOT / "docs" / "design" / name).is_file()]
check("design_documentation", not missing_docs, f"missing={missing_docs}")

shots = ROOT / "evidence" / "visual-upgrade" / "screenshots"
required_shots = [
    "landing-desktop-1440x1000.png", "landing-mobile-390x844.png",
    "today-desktop-1440x1000.png", "today-mobile-390x844.png",
    "story-desktop-1440x1000.png", "story-mobile-390x844.png",
    "components-desktop-1280x900.png",
    "landing-light-desktop-1440x1000.png",
    "today-light-desktop-1440x1000.png",
    "components-light-desktop-1280x900.png",
]
missing_shots = [name for name in required_shots if not (shots / name).is_file() or (shots / name).stat().st_size < 10_000]
check("visual_evidence", not missing_shots, f"missing_or_small={missing_shots}")

assets = [path for path in (WEB / "public" / "art").rglob("*") if path.is_file()]
zero_assets = [path.relative_to(ROOT).as_posix() for path in assets if path.stat().st_size == 0]
check("asset_integrity", bool(assets) and not zero_assets, f"assets={len(assets)}; zero_bytes={zero_assets}")

failed = [item for item in checks if item["status"] == "FAIL"]
report = {"validator": "visual-design-source-gate", "scope": "source contracts and static evidence only", "checks": checks, "passed": len(checks) - len(failed), "failed": len(failed), "result": "PASS" if not failed else "FAIL"}
print(json.dumps(report, ensure_ascii=False, indent=2))
raise SystemExit(1 if failed else 0)
