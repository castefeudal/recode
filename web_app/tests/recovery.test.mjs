import test from "node:test";
import assert from "node:assert/strict";
import { assessRecovery, sleepDurationMinutes } from "../app/domain/recovery.ts";

function state(overrides = {}) {
  return {
    schemaVersion: 6,
    name: "Player",
    origin: "potential",
    lang: "en",
    day: 7,
    currentSceneId: null,
    completedScenes: [], selectedChoices: [], realActions: [], dailyRecords: [],
    stats: { body: 50, energy: 55, balance: 50, mind: 60, discipline: 45, connections: 55 },
    xp: 0, focus: 3, momentum: 0, material: 0, stability: 50, streak: 0, returns: 0, room: 0, skipCount: 0,
    relationships: {}, flags: {}, pending: [], consequenceLog: [], journal: [], questJournal: {}, activeQuestIds: [], completedQuestIds: [], eventHistory: [], favoriteExercises: [], workoutHistory: [], foodEntries: [], sleepEntries: [],
    finance: { income: 0, essentials: 0, flexible: 0, reserve: 0 },
    cloud: { consented: false, apiUrl: "", revision: 0 },
    accessibility: { reducedMotion: false, highContrast: false },
    journey: { firstChoiceMade: false, firstRealActionDone: false, firstArcCompleted: false },
    saveMeta: { createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString(), recoveryCount: 0 },
    endingId: null,
    ...overrides,
  };
}

test("sleep duration handles overnight intervals", () => {
  assert.equal(sleepDurationMinutes("23:30", "07:00"), 450);
  assert.equal(sleepDurationMinutes("01:00", "06:30"), 330);
});

test("recovery reports insufficient data instead of inventing a score", () => {
  const assessment = assessRecovery(state(), "en");
  assert.equal(assessment.band, "insufficient");
  assert.equal(assessment.hasEnoughData, false);
  assert.equal(assessment.sleepMinutes, null);
});

test("short low-quality sleep produces an explainable below-baseline assessment", () => {
  const assessment = assessRecovery(state({
    stats: { body: 50, energy: 28, balance: 50, mind: 60, discipline: 45, connections: 55 },
    sleepEntries: [{ id: "s1", bedtime: "01:00", wake: "06:30", quality: 4, day: 7 }],
  }), "en");
  assert.equal(assessment.band, "below");
  assert.equal(assessment.sleepMinutes, 330);
  assert.ok(assessment.factors.some((factor) => /shorter than 6 hours/i.test(factor)));
  assert.ok(assessment.factors.some((factor) => /4\/10/.test(factor)));
  assert.match(assessment.adjustment, /reduce volume or difficulty/i);
});
