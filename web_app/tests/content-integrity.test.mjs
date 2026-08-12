import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const readJson = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8"));

test("canonical content keeps the complete Source A contract", () => {
  const season = readJson("../public/content/season_01.json");
  const quests = readJson("../public/content/quests.json");
  const events = readJson("../public/content/events.json");
  const exercises = readJson("../public/content/exercises.json");
  const characters = readJson("../public/content/characters.json");

  assert.equal(season.chapters.length, 14);
  assert.equal(season.scenes.length, 140);
  assert.equal(season.choices.length, 420);
  assert.equal(season.delayed_consequences.length, 70);
  assert.equal(season.ending_rules.length, 8);
  assert.equal(quests.length, 275);
  assert.equal(events.length, 160);
  assert.equal(exercises.exercises.length, 1324);
  assert.equal(characters.length, 8);
});

test("canonical V10 art is shipped in the static runtime", () => {
  for (const path of [
    "../public/art/key/recode-hero-v10.webp",
    "../public/art/key/recode-origins-v10.webp",
    "../public/art/locations/recode-meridian-city-v10.webp",
  ]) {
    assert.equal(existsSync(new URL(path, import.meta.url)), true, `${path} must ship`);
  }
});

