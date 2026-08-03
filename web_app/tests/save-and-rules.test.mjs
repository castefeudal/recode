import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  applyEffects, loadCampaign, migrateSave, newGame, sceneById, sceneText,
} from "../app/game.ts";

const season = JSON.parse(readFileSync(new URL("../public/content/season_01.json", import.meta.url), "utf8"));
globalThis.fetch = async () => new Response(JSON.stringify(season), {
  status: 200,
  headers: { "content-type": "application/json" },
});

test("survives 1000 save serialization and migration cycles", async () => {
  await loadCampaign();
  let state = newGame("QA", "return", "ru");
  for (let cycle = 0; cycle < 1000; cycle += 1) {
    const restored = migrateSave(JSON.parse(JSON.stringify(state)));
    assert.ok(restored);
    assert.equal(restored.schemaVersion, 6);
    assert.equal(restored.name, "QA");
    state = { ...restored, day: restored.day + 1, xp: restored.xp + cycle };
  }
  assert.equal(state.day, 1001);
  assert.equal(migrateSave(null), null);
  assert.equal(migrateSave({ schemaVersion: 6 }), null);
  assert.equal(migrateSave({ ...state, schemaVersion: 7 }), null);
  assert.equal(migrateSave("corrupt"), null);
});

test("migrates schema 3, 4 and 5 to schema 6 and preserves conditional narrative rules", async () => {
  await loadCampaign();
  const current = newGame("Legacy", "lost", "en");
  const legacy = {
    ...current,
    schemaVersion: 3,
    dailyActions: ["move"],
  };
  const migrated = migrateSave(legacy);
  assert.ok(migrated);
  assert.equal(migrated.schemaVersion, 6);
  assert.deepEqual(migrated.dailyRecords, [{ actionId: "move", status: "completed", day: 1 }]);
  const v4 = { ...current, schemaVersion: 4 };
  const migratedV4 = migrateSave(v4);
  assert.ok(migratedV4);
  assert.equal(migratedV4.schemaVersion, 6);
  assert.deepEqual(migratedV4.accessibility, { reducedMotion: false, highContrast: false });
  const v5 = { ...current, schemaVersion: 5, journey: undefined, selectedChoices: ["legacy-choice"], realActions: ["legacy-action"] };
  const migratedV5 = migrateSave(v5);
  assert.ok(migratedV5);
  assert.equal(migratedV5.schemaVersion, 6);
  assert.equal(migratedV5.journey.firstChoiceMade, true);
  assert.equal(migratedV5.journey.firstRealActionDone, true);

  const lowEnergy = { ...migrated, stats: { ...migrated.stats, energy: 30 } };
  assert.match(sceneText(sceneById.ch05_s08, lowEnergy).en, /energy level/i);
  const highEnergy = { ...lowEnergy, stats: { ...lowEnergy.stats, energy: 80 } };
  const affected = applyEffects(highEnergy, [{ stat: "energy", delta: 20 }]);
  assert.equal(affected.stats.energy, 90, "diminishing gain must apply above 75");
});

test("save migration rejects 1000 malformed fuzz inputs without throwing", async () => {
  await loadCampaign();
  const base = newGame("Юникод 🜂", "potential", "en");
  let seed = 0x5eed1234;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
  for (let index = 0; index < 1000; index += 1) {
    const candidate = JSON.parse(JSON.stringify(base));
    const mode = Math.floor(random() * 8);
    if (mode === 0) candidate.schemaVersion = 999;
    if (mode === 1) delete candidate.stats;
    if (mode === 2) candidate.name = "";
    if (mode === 3) candidate.stats.energy = Math.floor(random() * 100);
    if (mode === 4) candidate.relationships = {};
    if (mode === 5) delete candidate.saveMeta;
    if (mode === 6) candidate.schemaVersion = 4;
    if (mode === 7) candidate.cloud = { consented: false };
    const migrated = migrateSave(candidate);
    if ([0, 1, 2].includes(mode)) assert.equal(migrated, null);
    else {
      assert.ok(migrated);
      assert.equal(migrated.schemaVersion, 6);
      assert.equal(migrated.name, "Юникод 🜂");
    }
  }
});
