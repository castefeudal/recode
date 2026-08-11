import test from "node:test";
import assert from "node:assert/strict";
import { addExerciseToDraft, completeWorkout, formatPreviousResult, moveDraftExercise, recordSet, startWorkout } from "../app/domain/training.ts";

const exercise = (id, name) => ({
  id,
  name: { ru: name, en: name },
  body_part: "upper",
  equipment: "barbell",
  target_muscle: "chest",
  secondary_muscles: [],
  instructions: { ru: [], en: [] },
  safety: { pain_response: { ru: "stop", en: "stop" } },
});

test("builder adds exercises once and supports reordering", () => {
  let draft = addExerciseToDraft([], exercise("bench", "Bench Press"));
  draft = addExerciseToDraft(draft, exercise("row", "Row"));
  draft = addExerciseToDraft(draft, exercise("bench", "Bench Press"));
  assert.equal(draft.length, 2);
  draft = moveDraftExercise(draft, 1, -1);
  assert.equal(draft[0].exerciseId, "row");
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
