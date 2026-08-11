import test from "node:test";
import assert from "node:assert/strict";
import { buildProgressInsight, weeklyProgress } from "../app/domain/progress.ts";

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

test("early users see only real elapsed weekly windows", () => {
  const weeks = weeklyProgress(state({ day: 5 }), 4);
  assert.equal(weeks.length, 1);
  assert.deepEqual([weeks[0].startDay, weeks[0].endDay], [1, 5]);
});

test("four-week progress keeps return events separate from normal completions", () => {
  const insight = buildProgressInsight(state({
    day: 28,
    dailyRecords: [
      { actionId: "move", status: "completed", day: 3 },
      { actionId: "return", status: "completed", day: 8 },
      { actionId: "plan", status: "reduced", day: 15 },
      { actionId: "move", status: "completed", day: 28 },
    ],
    workoutHistory: ["D7 · Full Body · 5 exercises · 15 sets", "D28 · Upper · 4 exercises · 12 sets"],
  }), "en");
  assert.equal(insight.weeks.length, 4);
  assert.equal(insight.totalCompleted, 2);
  assert.equal(insight.totalAdapted, 1);
  assert.equal(insight.totalReturns, 1);
  assert.equal(insight.totalWorkouts, 2);
});

test("progress refuses confident advice when usable history is insufficient", () => {
  const insight = buildProgressInsight(state({ day: 3 }), "en");
  assert.equal(insight.confidence, "insufficient");
  assert.match(insight.decision, /not enough data/i);
});

test("repeated low sleep creates a recovery decision rather than a causal claim", () => {
  const insight = buildProgressInsight(state({
    day: 14,
    sleepEntries: [
      { id: "s14", bedtime: "01:00", wake: "06:00", quality: 4, day: 14 },
      { id: "s13", bedtime: "00:30", wake: "06:00", quality: 5, day: 13 },
      { id: "s12", bedtime: "01:00", wake: "06:30", quality: 4, day: 12 },
      { id: "s11", bedtime: "00:30", wake: "06:30", quality: 5, day: 11 },
    ],
  }), "en");
  assert.equal(insight.confidence, "observed");
  assert.match(insight.decision, /recovery remains a weak signal/i);
});
