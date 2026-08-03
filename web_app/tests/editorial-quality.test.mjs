import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const season = JSON.parse(readFileSync(new URL("../public/content/season_01.json", import.meta.url), "utf8"));

function duplicates(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].filter(([, count]) => count > 1);
}

test("season 01 passes the v7 anti-boilerplate editorial contract", () => {
  assert.equal(season.design_contract.editorial_rewrite, "7.0");
  assert.equal(season.design_contract.semantic_repetition_gate, true);
  assert.equal(season.design_contract.human_review_claimed, false);
  assert.equal(season.scenes.length, 140);
  assert.equal(season.choices.length, 420);

  const corpus = JSON.stringify(season);
  const prohibited = [
    "требует точности",
    "не станет легче от красивого названия",
    "Сначала кажется",
    "Вопрос главы звучит прямо",
    "requires precision",
    "will not become easier because it has a better name",
    "The chapter's question is direct",
  ];
  for (const phrase of prohibited) {
    assert.equal(corpus.includes(phrase), false, `prohibited boilerplate remains: ${phrase}`);
  }

  for (const lang of ["ru", "en"]) {
    assert.deepEqual(duplicates(season.scenes.map((scene) => scene.text[lang])), [], `${lang} scene prose must be unique`);
    assert.deepEqual(duplicates(season.scenes.map((scene) => scene.dialogue[lang])), [], `${lang} dialogue must be unique`);
    assert.deepEqual(duplicates(season.choices.map((choice) => choice.text[lang])), [], `${lang} choice copy must be unique`);
    for (const scene of season.scenes) {
      assert.ok(scene.text[lang].length >= 170, `${scene.id}.${lang} prose is underdeveloped`);
      assert.ok(scene.dialogue[lang].length >= 75, `${scene.id}.${lang} dialogue is underdeveloped`);
    }
  }
});
