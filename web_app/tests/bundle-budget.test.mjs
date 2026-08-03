import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import test from "node:test";

test("keeps canonical campaign out of the initial client bundle", () => {
  const assetDir = new URL("../dist/client/assets/", import.meta.url);
  const files = readdirSync(assetDir).filter((name) => name.endsWith(".js"));
  const pageFiles = files.filter((name) => name.startsWith("page-"));
  assert.ok(pageFiles.length >= 1, "page client chunk must exist");
  const source = pageFiles.map((name) => readFileSync(new URL(name, assetDir))).join("\n");
  assert.equal(source.includes("prologue_s01_c01"), false, "story payload leaked into page JS");
  const gzipBytes = pageFiles.reduce(
    (total, name) => total + gzipSync(readFileSync(new URL(name, assetDir))).byteLength,
    0,
  );
  assert.ok(gzipBytes < 150_000, `page chunks exceed 150 KB gzip budget: ${gzipBytes}`);
  assert.ok(existsSync(new URL("../dist/client/content/season_01.json", import.meta.url)));
});

test("ships art-directed AVIF/WebP key art inside strict budgets", () => {
  const assets = [
    ["hero-desktop-v6.avif", 70_000],
    ["hero-mobile-v6.avif", 80_000],
    ["cast-v6.avif", 60_000],
    ["hero-desktop-v6.webp", 150_000],
    ["hero-mobile-v6.webp", 170_000],
    ["cast-v6.webp", 130_000],
  ];
  for (const [name, budget] of assets) {
    const file = new URL(`../dist/client/art/key/${name}`, import.meta.url);
    assert.ok(existsSync(file), `${name} must ship`);
    assert.ok(statSync(file).size < budget, `${name} exceeds ${budget} bytes`);
  }
});
