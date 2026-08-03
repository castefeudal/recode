import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const client = readFileSync(new URL("../app/infrastructure/cloud-api.ts", import.meta.url), "utf8");
const panel = readFileSync(new URL("../app/components/CloudPanel.tsx", import.meta.url), "utf8");
const backend = readFileSync(new URL("../../backend/app/main.py", import.meta.url), "utf8");

test("client and backend share structured save-conflict envelope", () => {
  assert.match(backend, /"code": "save_conflict", "server_revision": current_revision/);
  assert.match(client, /detail\.server_revision/);
  assert.match(panel, /error\.serverRevision/);
  assert.doesNotMatch(panel, /data\.detail\?\.server_revision/);
});

test("cloud sync uses an explicit privacy allowlist", () => {
  assert.match(client, /Explicit allowlist/);
  for (const sensitive of ["journal: state.journal", "foodEntries: state.foodEntries", "sleepEntries: state.sleepEntries", "apiUrl: state.cloud.apiUrl"]) {
    assert.equal(client.includes(sensitive), false, `${sensitive} must not be uploaded`);
  }
  assert.match(client, /schema_version: state\.schemaVersion/);
});
