import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");

const tokens = read("app/design-system/tokens.css");
const base = read("app/design-system/base.css");
const visual = read("app/design-system/visual-upgrade.css");
const globals = read("app/globals.css");
const page = read("app/page.tsx");
const components = read("app/design-system/components.tsx");
const icons = read("app/design-system/Icon.tsx");

function pngDimensions(path) {
  const buffer = readFileSync(path);
  assert.equal(buffer.subarray(1, 4).toString("ascii"), "PNG", `${path} is not a PNG`);
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

test("design system styles are layered in deterministic order", () => {
  const expected = ["tokens.css", "base.css", "legacy.css", "visual-upgrade.css"];
  let cursor = -1;
  for (const file of expected) {
    const index = globals.indexOf(file);
    assert.ok(index > cursor, `${file} must follow the previous layer`);
    cursor = index;
  }
});

test("semantic foundations cover themes, typography, spacing, motion and states", () => {
  const required = [
    '[data-theme="dark"]', '[data-theme="light"]', '[data-contrast="high"]',
    "--color-canvas", "--color-surface-1", "--color-text-primary", "--color-brand",
    "--color-success", "--color-warning", "--color-danger", "--color-info",
    "--font-display", "--font-editorial", "--font-mono", "--text-hero",
    "--space-1", "--space-12", "--radius-sm", "--radius-xl", "--shadow-3",
    "--duration-fast", "--duration-base", "--ease-standard", "--z-dialog",
  ];
  for (const token of required) assert.match(tokens, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `missing ${token}`);
});

test("accessibility contracts include focus, motion, contrast and touch targets", () => {
  assert.match(base, /:focus-visible/);
  assert.match(base, /prefers-reduced-motion:\s*reduce/);
  assert.match(base, /min-height:\s*max\([^)]*44px/);
  assert.match(visual, /@media\s*\(prefers-contrast:\s*more\)/);
  assert.match(page, /className="skipLink"/);
  assert.match(page, /aria-label=/);
  assert.match(page, /aria-live=/);
});

test("responsive system explicitly supports compact mobile and wide desktop", () => {
  for (const breakpoint of ["74rem", "60rem", "47.5rem", "23rem"]) {
    assert.ok(visual.includes(breakpoint), `missing responsive treatment for ${breakpoint}`);
  }
  assert.match(visual, /env\(safe-area-inset-bottom/);
  assert.match(`${base}\n${visual}`, /100dvh/);
});

test("component primitives expose core states and accessible APIs", () => {
  for (const name of ["Button", "IconButton", "TextLink", "Badge", "Card", "ProgressBar", "StatusIndicator", "Field", "TextAreaField", "SelectField", "CheckboxField", "RadioGroup", "Switch", "SliderField", "Tabs", "SegmentedControl", "Tooltip", "Popover", "Sheet", "ToastMessage", "Avatar", "ResponsiveImage", "NarrativeCard", "StatBlock", "Timeline", "Choice", "AppHeader", "AppFooter", "Skeleton", "Alert", "EmptyState", "DialogFrame"]) {
    assert.ok(components.includes(`function ${name}`), `missing ${name}`);
  }
  assert.match(components, /aria-invalid/);
  assert.match(components, /role="progressbar"/);
  assert.match(components, /aria-modal="true"/);
  assert.match(components, /aria-pressed=/);
  assert.match(icons, /aria-hidden=/);
});

test("theme and icon controls are integrated into all principal shells", () => {
  assert.match(page, /type Theme = "dark" \| "light"/);
  assert.match(page, /localStorage\.setItem\("recode-theme"/);
  assert.match(page, /documentElement\.dataset\.theme/);
  assert.match(page, /<Icon name=/);
  assert.match(page, /themeButton/);
  assert.match(page, /activeScreenLabel/);
});

test("visual evidence covers desktop and mobile critical surfaces", () => {
  const evidenceRoot = resolve(root, "..", "evidence", "visual-upgrade", "screenshots");
  const expected = new Map([
    ["landing-desktop-1440x1000.png", [1440, 1000]],
    ["landing-mobile-390x844.png", [390, 844]],
    ["today-desktop-1440x1000.png", [1440, 1000]],
    ["today-mobile-390x844.png", [390, 844]],
    ["story-desktop-1440x1000.png", [1440, 1000]],
    ["story-mobile-390x844.png", [390, 844]],
    ["components-desktop-1280x900.png", [1280, 900]],
    ["landing-light-desktop-1440x1000.png", [1440, 1000]],
    ["today-light-desktop-1440x1000.png", [1440, 1000]],
    ["components-light-desktop-1280x900.png", [1280, 900]],
  ]);
  for (const [name, [width, height]] of expected) {
    const file = resolve(evidenceRoot, name);
    assert.ok(existsSync(file), `missing ${name}`);
    assert.deepEqual(pngDimensions(file), { width, height });
  }
});
