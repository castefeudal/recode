export type TrainingTemplate = "full-body" | "upper" | "lower" | "push" | "pull" | "legs" | "mobility" | "recovery" | "custom";

export type ExerciseSummary = {
  id: string;
  name: { ru: string; en: string };
  body_part: string;
  equipment: string;
  target_muscle: string;
  secondary_muscles: string[];
  instructions: { ru: string[]; en: string[] };
  safety: { pain_response: { ru: string; en: string } };
};

export type PlannedExercise = {
  exerciseId: string;
  name: string;
  sets: number;
  reps: number;
  load: number | null;
  rir: number | null;
  restSeconds: number;
  notes: string;
};

export type CompletedSet = {
  reps: number;
  load: number | null;
  rir: number | null;
  completedAt: string;
};

export type CompletedExercise = PlannedExercise & {
  setsDone: CompletedSet[];
};

export type WorkoutSession = {
  id: string;
  template: TrainingTemplate;
  name: string;
  startedAt: string;
  completedAt: string | null;
  exercises: CompletedExercise[];
  notes: string;
};

export type TrainingState = {
  schemaVersion: 1;
  draft: PlannedExercise[];
  activeSession: WorkoutSession | null;
  history: WorkoutSession[];
  favouriteExerciseIds: string[];
};

export const EMPTY_TRAINING_STATE: TrainingState = {
  schemaVersion: 1,
  draft: [],
  activeSession: null,
  history: [],
  favouriteExerciseIds: [],
};

export const templateMeta: Record<TrainingTemplate, { ru: string; en: string; filter?: string }> = {
  "full-body": { ru: "Всё тело", en: "Full Body" },
  upper: { ru: "Верх", en: "Upper", filter: "upper" },
  lower: { ru: "Низ", en: "Lower", filter: "lower" },
  push: { ru: "Жим", en: "Push", filter: "push" },
  pull: { ru: "Тяга", en: "Pull", filter: "pull" },
  legs: { ru: "Ноги", en: "Legs", filter: "leg" },
  mobility: { ru: "Мобильность", en: "Mobility", filter: "mobility" },
  recovery: { ru: "Восстановление", en: "Recovery", filter: "stretch" },
  custom: { ru: "Своя", en: "Custom" },
};

export function normalizeTrainingState(value: unknown): TrainingState {
  if (!value || typeof value !== "object") return { ...EMPTY_TRAINING_STATE };
  const input = value as Partial<TrainingState>;
  if (input.schemaVersion !== 1) return { ...EMPTY_TRAINING_STATE };
  return {
    schemaVersion: 1,
    draft: Array.isArray(input.draft) ? input.draft : [],
    activeSession: input.activeSession && typeof input.activeSession === "object" ? input.activeSession : null,
    history: Array.isArray(input.history) ? input.history.slice(0, 100) : [],
    favouriteExerciseIds: Array.isArray(input.favouriteExerciseIds) ? input.favouriteExerciseIds.filter((id): id is string => typeof id === "string") : [],
  };
}

export function addExerciseToDraft(draft: PlannedExercise[], exercise: ExerciseSummary): PlannedExercise[] {
  if (draft.some((item) => item.exerciseId === exercise.id)) return draft;
  return [...draft, {
    exerciseId: exercise.id,
    name: exercise.name.en,
    sets: 3,
    reps: 8,
    load: null,
    rir: 3,
    restSeconds: 120,
    notes: "",
  }];
}

export function moveDraftExercise(draft: PlannedExercise[], index: number, direction: -1 | 1): PlannedExercise[] {
  const target = index + direction;
  if (index < 0 || target < 0 || index >= draft.length || target >= draft.length) return draft;
  const next = [...draft];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function startWorkout(draft: PlannedExercise[], template: TrainingTemplate, name: string, now = new Date()): WorkoutSession {
  return {
    id: `workout-${now.getTime()}`,
    template,
    name: name.trim() || templateMeta[template].en,
    startedAt: now.toISOString(),
    completedAt: null,
    exercises: draft.map((exercise) => ({ ...exercise, setsDone: [] })),
    notes: "",
  };
}

export function recordSet(session: WorkoutSession, exerciseIndex: number, set: Omit<CompletedSet, "completedAt">, now = new Date()): WorkoutSession {
  if (!session.exercises[exerciseIndex] || session.completedAt) return session;
  return {
    ...session,
    exercises: session.exercises.map((exercise, index) => index === exerciseIndex
      ? { ...exercise, setsDone: [...exercise.setsDone, { ...set, completedAt: now.toISOString() }] }
      : exercise),
  };
}

export function completeWorkout(session: WorkoutSession, now = new Date()): WorkoutSession {
  return { ...session, completedAt: session.completedAt ?? now.toISOString() };
}

export function previousExerciseResult(history: WorkoutSession[], exerciseId: string): CompletedExercise | null {
  for (const session of history) {
    const found = session.exercises.find((exercise) => exercise.exerciseId === exerciseId && exercise.setsDone.length > 0);
    if (found) return found;
  }
  return null;
}

export function formatPreviousResult(exercise: CompletedExercise | null): string {
  if (!exercise || !exercise.setsDone.length) return "—";
  return exercise.setsDone.map((set) => `${set.load ?? "BW"} × ${set.reps}`).join(" / ");
}
