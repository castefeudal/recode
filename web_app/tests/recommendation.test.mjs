import test from "node:test";
import assert from "node:assert/strict";
import { getDailyRecommendation } from "../app/domain/recommendation.ts";
import { buildWeeklyReview } from "../app/domain/weekly-review.ts";
import { applyReturn, getReturnProtocol } from "../app/domain/return-protocol.ts";

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

test("low sleep makes recovery the priority and reduces action scale", () => {
  const recommendation = getDailyRecommendation(state({
    sleepEntries: [{ id: "s1", bedtime: "01:00", wake: "06:30", quality: 4, day: 7 }],
  }), "en");
  assert.equal(recommendation.priority, "recovery");
  assert.equal(recommendation.readinessState, "low");
  assert.ok(recommendation.minutes <= 6);
  assert.match(recommendation.reason, /sleep/i);
});

test("weakest domain drives a transparent baseline recommendation", () => {
  const recommendation = getDailyRecommendation(state({
    stats: { body: 22, energy: 60, balance: 55, mind: 65, discipline: 58, connections: 61 },
  }), "en");
  assert.equal(recommendation.priority, "body");
  assert.equal(recommendation.actionId, "move");
  assert.equal(recommendation.confidence, "baseline");
  assert.ok(recommendation.signals.includes("body:22"));
});

test("weekly review never invents an insight when history is insufficient", () => {
  const review = buildWeeklyReview(state(), "en");
  assert.equal(review.sleepTrend, "insufficient");
  assert.equal(review.observation, null);
  assert.match(review.wins[0], /not enough history/i);
});

test("weekly review labels low-sleep association as observation, not causation", () => {
  const review = buildWeeklyReview(state({
    dailyRecords: [
      { actionId: "move", status: "reduced", day: 5 },
      { actionId: "plan", status: "skipped", day: 6 },
      { actionId: "move", status: "completed", day: 7 },
    ],
    sleepEntries: [
      { id: "s7", bedtime: "23:30", wake: "07:00", quality: 7, day: 7 },
      { id: "s6", bedtime: "01:00", wake: "06:00", quality: 4, day: 6 },
      { id: "s5", bedtime: "00:30", wake: "06:00", quality: 5, day: 5 },
      { id: "s4", bedtime: "23:00", wake: "07:00", quality: 7, day: 4 },
    ],
  }), "en");
  assert.ok(review.observation);
  assert.match(review.disclaimer, /not evidence of causation/i);
});

test("return protocol activates after two days away without deleting progress and is idempotent for the day", () => {
  const base = state({ returns: 2, xp: 100, stability: 45, focus: 2 });
  const protocol = getReturnProtocol(base, "en", 4);
  assert.equal(protocol.active, true);
  assert.deepEqual(protocol.options.map((option) => option.minutes), [3, 10, 25]);
  const returned = applyReturn(base, "minimum", new Date("2026-08-11T10:00:00Z"));
  assert.equal(returned.returns, 3);
  assert.ok(returned.xp > base.xp);
  assert.ok(returned.stability >= base.stability);
  assert.equal(returned.flags["return.completed"], true);
  assert.equal(returned.flags["return.day.7"], true);
  assert.equal(returned.dailyRecords.filter((record) => record.actionId === "return" && record.day === 7).length, 1);
  assert.equal(returned.day, base.day);
  assert.equal(getReturnProtocol(returned, "en", 4).active, false);
  const duplicate = applyReturn(returned, "full", new Date("2026-08-11T11:00:00Z"));
  assert.equal(duplicate.returns, returned.returns);
  assert.equal(duplicate.xp, returned.xp);
  assert.equal(duplicate.dailyRecords.length, returned.dailyRecords.length);
});

test("weekly review counts returns only inside the current week and excludes them from normal completions", () => {
  const review = buildWeeklyReview(state({
    day: 14,
    returns: 12,
    dailyRecords: [
      { actionId: "return", status: "completed", day: 2 },
      { actionId: "return", status: "completed", day: 14 },
      { actionId: "move", status: "completed", day: 14 },
    ],
  }), "en", "Personalized focus");
  assert.equal(review.returns, 1);
  assert.equal(review.completedActions, 1);
  assert.equal(review.nextFocus, "Personalized focus");
});
