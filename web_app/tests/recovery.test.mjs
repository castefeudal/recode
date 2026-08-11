import test from "node:test";
import assert from "node:assert/strict";
import { assessRecovery, sleepDurationMinutes, upsertSleepEntry } from "../app/domain/recovery.ts";

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

test("sleep duration handles overnight intervals and rejects impossible times", () => {
  assert.equal(sleepDurationMinutes("23:30", "07:00"), 450);
  assert.equal(sleepDurationMinutes("01:00", "06:30"), 330);
  assert.equal(sleepDurationMinutes("25:00", "07:00"), null);
  assert.equal(sleepDurationMinutes("23:75", "07:00"), null);
});

test("sleep check-in is an upsert per day instead of duplicated history", () => {
  const existing = [{ id: "old", bedtime: "23:00", wake: "07:00", quality: 6, day: 7 }, { id: "d6", bedtime: "23:30", wake: "07:00", quality: 7, day: 6 }];
  const next = upsertSleepEntry(existing, { id: "old", bedtime: "00:00", wake: "07:30", quality: 8, day: 7 });
  assert.equal(next.length, 2);
  assert.equal(next.filter((entry) => entry.day === 7).length, 1);
  assert.equal(next[0].quality, 8);
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

test("previous-day workout is shown as context without becoming a magic score", () => {
  const assessment = assessRecovery(state({
    sleepEntries: [{ id: "s1", bedtime: "23:30", wake: "07:00", quality: 6, day: 7 }],
    workoutHistory: ["D6 · Full Body · 5 exercises · 15 sets · structured:abc"],
  }), "en");
  assert.ok(assessment.factors.some((factor) => /workout was recorded yesterday/i.test(factor)));
});
