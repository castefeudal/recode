import test from "node:test";
import assert from "node:assert/strict";
import { addExerciseToDraft, buildTemplateDraft, completeWorkout, formatPreviousResult, moveDraftExercise, normalizeTrainingState, recordSet, startWorkout } from "../app/domain/training.ts";

const exercise = (id, name, overrides = {}) => ({
  id,
  name: { ru: `${name} RU`, en: name },
  body_part: "upper",
  equipment: "barbell",
  target_muscle: "chest",
  secondary_muscles: [],
  instructions: { ru: [], en: [] },
  safety: { pain_response: { ru: "stop", en: "stop" } },
  ...overrides,
});

test("builder adds exercises once, localizes names and supports reordering", () => {
  let draft = addExerciseToDraft([], exercise("bench", "Bench Press"), "ru");
  draft = addExerciseToDraft(draft, exercise("row", "Row"), "ru");
  draft = addExerciseToDraft(draft, exercise("bench", "Bench Press"), "ru");
  assert.equal(draft.length, 2);
  assert.equal(draft[0].name, "Bench Press RU");
  draft = moveDraftExercise(draft, 1, -1);
  assert.equal(draft[0].exerciseId, "row");
});

test("templates create an editable draft from matching exercise data", () => {
  const library = [
    exercise("bench", "Bench Press", { target_muscle: "chest" }),
    exercise("ohp", "Shoulder Press", { target_muscle: "shoulder" }),
    exercise("triceps", "Triceps Press", { target_muscle: "triceps" }),
    exercise("row", "Row", { target_muscle: "back" }),
  ];
  const push = buildTemplateDraft(library, "push", "en");
  assert.ok(push.length >= 2);
  assert.ok(push.every((item) => ["bench", "ohp", "triceps"].includes(item.exerciseId)));
  assert.equal(buildTemplateDraft(library, "custom", "en").length, 0);
});

test("session stores real completed sets and formats previous performance", () => {
  const draft = addExerciseToDraft([], exercise("bench", "Bench Press"));
  let session = startWorkout(draft, "full-body", "A", new Date("2026-08-10T10:00:00Z"));
  session = recordSet(session, 0, { reps: 8, load: 80, rir: 2 }, new Date("2026-08-10T10:01:00Z"));
  session = recordSet(session, 0, { reps: 7, load: 80, rir: 1 }, new Date("2026-08-10T10:03:00Z"));
  session = completeWorkout(session, new Date("2026-08-10T10:30:00Z"));
  assert.equal(session.exercises[0].setsDone.length, 2);
  assert.equal(formatPreviousResult(session.exercises[0]), "80 × 8 / 80 × 7");
  assert.ok(session.completedAt);
});

test("corrupted training store is sanitized instead of crashing the UI", () => {
  const state = normalizeTrainingState({
    schemaVersion: 1,
    draft: [null, { exerciseId: "bench", name: "Bench", sets: 999, reps: -3, restSeconds: 0, notes: 42 }],
    activeSession: { id: "broken", startedAt: "not-a-date" },
    history: [{ id: "bad", startedAt: "invalid" }],
    favouriteExerciseIds: ["bench", "bench", null, 42],
  });
  assert.equal(state.draft.length, 1);
  assert.equal(state.draft[0].sets, 10);
  assert.equal(state.draft[0].reps, 1);
  assert.equal(state.draft[0].restSeconds, 15);
  assert.equal(state.activeSession, null);
  assert.deepEqual(state.history, []);
  assert.deepEqual(state.favouriteExerciseIds, ["bench"]);
});
