import test from "node:test";
import assert from "node:assert/strict";
import { applyProfileToRecommendation, normalizeProfile } from "../app/domain/profile.ts";

const base = {
  priority: "body",
  readinessState: "ready",
  actionId: "move",
  minutes: 10,
  title: "Ten precise minutes",
  reason: "Body is currently the weakest domain.",
  confidence: "moderate",
  alternatives: [
    { status: "reduced", minutes: 5, label: "Reduce" },
    { status: "replaced", minutes: 10, label: "Replace" },
    { status: "deferred", minutes: 0, label: "Defer" },
    { status: "skipped", minutes: 0, label: "Skip honestly" },
  ],
  signals: ["body:22"],
};

test("profile caps an action to actually available time", () => {
  const result = applyProfileToRecommendation(base, {
    schemaVersion: 1,
    primaryGoal: "fitness",
    availableMinutes: 5,
    enabledModules: ["training", "recovery", "mind", "focus"],
  }, "en");
  assert.equal(result.minutes, 5);
  assert.match(result.reason, /5 minutes available/i);
});

test("disabled modules are not repeatedly pushed as a priority", () => {
  const result = applyProfileToRecommendation(base, {
    schemaVersion: 1,
    primaryGoal: "system",
    availableMinutes: 10,
    enabledModules: ["recovery", "mind", "focus"],
  }, "en");
  assert.equal(result.priority, "focus");
  assert.equal(result.actionId, "plan");
  assert.match(result.reason, /training module is disabled/i);
});

test("profile normalization rejects unsupported values", () => {
  const result = normalizeProfile({ schemaVersion: 99, primaryGoal: "magic", availableMinutes: 999, enabledModules: ["training", "unknown"] });
  assert.equal(result.schemaVersion, 1);
  assert.equal(result.primaryGoal, "system");
  assert.equal(result.availableMinutes, 10);
  assert.deepEqual(result.enabledModules, ["training"]);
});
