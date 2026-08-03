import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const sw = readFileSync(new URL("../public/sw.js", import.meta.url), "utf8");
const manifest = JSON.parse(readFileSync(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"));

test("service worker has explicit install, update and offline navigation contracts", () => {
  assert.match(sw, /RECODE_ACTIVATE_UPDATE/);
  assert.match(sw, /event\.request\.mode === "navigate"/);
  assert.match(sw, /ignoreSearch: true/);
  assert.match(sw, /Offline shell unavailable/);
});

test("manifest remains installable and scoped", () => {
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.scope, "/");
  assert.ok(manifest.icons.some((icon) => icon.sizes === "192x192"));
  assert.ok(manifest.icons.some((icon) => icon.sizes === "512x512"));
});
