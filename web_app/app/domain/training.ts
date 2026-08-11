export type TrainingTemplate = "full-body" | "upper" | "lower" | "push" | "pull" | "legs" | "mobility" | "recovery" | "custom";
export type TrainingLang = "ru" | "en";

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

export const templateMeta: Record<TrainingTemplate, { ru: string; en: string }> = {
  "full-body": { ru: "Всё тело", en: "Full Body" },
  upper: { ru: "Верх", en: "Upper" },
  lower: { ru: "Низ", en: "Lower" },
  push: { ru: "Жим", en: "Push" },
  pull: { ru: "Тяга", en: "Pull" },
  legs: { ru: "Ноги", en: "Legs" },
  mobility: { ru: "Мобильность", en: "Mobility" },
  recovery: { ru: "Восстановление", en: "Recovery" },
  custom: { ru: "Своя", en: "Custom" },
};

const templatePatterns: Partial<Record<TrainingTemplate, RegExp>> = {
  upper: /upper|chest|back|shoulder|arm|biceps|triceps|forearm|lat|pec|delt|row|press/i,
  lower: /lower|leg|quad|hamstring|glute|calf|hip|adductor|abductor/i,
  push: /push|press|chest|pec|shoulder|delt|triceps/i,
  pull: /pull|row|back|lat|biceps|rear delt|trapez/i,
  legs: /leg|quad|hamstring|glute|calf|hip|adductor|abductor/i,
  mobility: /mobility|stretch|flex|range of motion|yoga|dynamic|rotation/i,
  recovery: /recovery|stretch|mobility|breath|relax|gentle|yoga|flex/i,
};

function finiteNumber(value: unknown, fallback: number, min: number, max: number): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}

function nullableNumber(value: unknown, min: number, max: number): number | null {
  if (value === null || value === undefined || value === "") return null;
  return typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : null;
}

function safeText(value: unknown, fallback = "", max = 1000): string {
  return typeof value === "string" ? value.slice(0, max) : fallback;
}

function normalizePlannedExercise(value: unknown): PlannedExercise | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Partial<PlannedExercise>;
  if (typeof input.exerciseId !== "string" || !input.exerciseId || typeof input.name !== "string" || !input.name) return null;
  return {
    exerciseId: input.exerciseId,
    name: input.name.slice(0, 160),
    sets: Math.round(finiteNumber(input.sets, 3, 1, 10)),
    reps: Math.round(finiteNumber(input.reps, 8, 1, 100)),
    load: nullableNumber(input.load, 0, 2000),
    rir: nullableNumber(input.rir, 0, 10),
    restSeconds: Math.round(finiteNumber(input.restSeconds, 120, 15, 600)),
    notes: safeText(input.notes),
  };
}

function normalizeCompletedSet(value: unknown): CompletedSet | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Partial<CompletedSet>;
  const completedAt = safeText(input.completedAt, "", 64);
  if (!completedAt || !Number.isFinite(Date.parse(completedAt))) return null;
  return {
    reps: Math.round(finiteNumber(input.reps, 1, 1, 100)),
    load: nullableNumber(input.load, 0, 2000),
    rir: nullableNumber(input.rir, 0, 10),
    completedAt,
  };
}

function normalizeSession(value: unknown): WorkoutSession | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Partial<WorkoutSession>;
  const templates = Object.keys(templateMeta) as TrainingTemplate[];
  if (typeof input.id !== "string" || !input.id || typeof input.startedAt !== "string" || !Number.isFinite(Date.parse(input.startedAt))) return null;
  const exercises = Array.isArray(input.exercises)
    ? input.exercises.flatMap((exercise) => {
        const planned = normalizePlannedExercise(exercise);
        if (!planned) return [];
        const setsDone = exercise && typeof exercise === "object" && Array.isArray((exercise as Partial<CompletedExercise>).setsDone)
          ? (exercise as Partial<CompletedExercise>).setsDone!.flatMap((set) => {
              const normalized = normalizeCompletedSet(set);
              return normalized ? [normalized] : [];
            })
          : [];
        return [{ ...planned, setsDone }];
      })
    : [];
  const completedAt = typeof input.completedAt === "string" && Number.isFinite(Date.parse(input.completedAt)) ? input.completedAt : null;
  return {
    id: input.id,
    template: templates.includes(input.template as TrainingTemplate) ? input.template as TrainingTemplate : "custom",
    name: safeText(input.name, templateMeta.custom.en, 160),
    startedAt: input.startedAt,
    completedAt,
    exercises,
    notes: safeText(input.notes),
  };
}

export function normalizeTrainingState(value: unknown): TrainingState {
  if (!value || typeof value !== "object") return { ...EMPTY_TRAINING_STATE };
  const input = value as Partial<TrainingState>;
  if (input.schemaVersion !== 1) return { ...EMPTY_TRAINING_STATE };
  const draft = Array.isArray(input.draft) ? input.draft.flatMap((item) => {
    const normalized = normalizePlannedExercise(item);
    return normalized ? [normalized] : [];
  }).slice(0, 30) : [];
  const activeSession = normalizeSession(input.activeSession);
  const history = Array.isArray(input.history) ? input.history.flatMap((item) => {
    const normalized = normalizeSession(item);
    return normalized ? [normalized] : [];
  }).slice(0, 100) : [];
  const favouriteExerciseIds = Array.isArray(input.favouriteExerciseIds)
    ? [...new Set(input.favouriteExerciseIds.filter((id): id is string => typeof id === "string" && id.length > 0))].slice(0, 500)
    : [];
  return { schemaVersion: 1, draft, activeSession, history, favouriteExerciseIds };
}

function plannedFromExercise(exercise: ExerciseSummary, lang: TrainingLang): PlannedExercise {
  return {
    exerciseId: exercise.id,
    name: exercise.name[lang] || exercise.name.en,
    sets: 3,
    reps: 8,
    load: null,
    rir: 3,
    restSeconds: 120,
    notes: "",
  };
}

export function addExerciseToDraft(draft: PlannedExercise[], exercise: ExerciseSummary, lang: TrainingLang = "en"): PlannedExercise[] {
  if (draft.some((item) => item.exerciseId === exercise.id)) return draft;
  return [...draft, plannedFromExercise(exercise, lang)];
}

function exerciseSearchText(exercise: ExerciseSummary): string {
  return [exercise.name.ru, exercise.name.en, exercise.body_part, exercise.target_muscle, exercise.equipment, ...exercise.secondary_muscles].join(" ").toLowerCase();
}

export function buildTemplateDraft(exercises: ExerciseSummary[], template: TrainingTemplate, lang: TrainingLang): PlannedExercise[] {
  if (template === "custom" || exercises.length === 0) return [];
  let selected: ExerciseSummary[] = [];

  if (template === "full-body") {
    const seenParts = new Set<string>();
    for (const exercise of exercises) {
      const part = exercise.body_part.trim().toLowerCase() || exercise.target_muscle.trim().toLowerCase();
      if (part && !seenParts.has(part)) {
        seenParts.add(part);
        selected.push(exercise);
      }
      if (selected.length >= 6) break;
    }
    if (selected.length < 4) selected = exercises.slice(0, 6);
  } else {
    const pattern = templatePatterns[template];
    if (pattern) selected = exercises.filter((exercise) => pattern.test(exerciseSearchText(exercise))).slice(0, 6);
  }

  return selected.map((exercise) => plannedFromExercise(exercise, lang));
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
