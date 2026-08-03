import assert from "node:assert/strict";
import test from "node:test";

const productionPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']production["'])[^>]*>/i;

test("renders production metadata and PWA contract", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, productionPreviewMeta);
  assert.match(html, /rel=["']manifest["'][^>]*manifest\.webmanifest/i);
  assert.match(html, /Original concept, system and authorship: Павел Марков/);
  assert.match(html, /BRANCHES<\/small>30/);
  assert.match(html, /LIVE CORE LOOP/);
  assert.match(html, /NOT A TRACKER|НЕ ТРЕКЕР/);
  assert.match(html, /og-recode-v7\.jpg/);
});
