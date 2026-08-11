import { clamp, type GameState } from "../game";
import type { WorkoutSession } from "../domain/training";
import { loadStoredSaveReady, persistStoredSave } from "./save-storage";

export async function recordCompletedWorkoutInGame(storage: Storage, session: WorkoutSession): Promise<GameState | null> {
  const loaded = await loadStoredSaveReady(storage);
  const state = loaded.state;
  if (!state || !session.completedAt) return state;
  const marker = `structured:${session.id}`;
  if (state.workoutHistory.some((entry) => entry.includes(marker))) return state;
  const sets = session.exercises.reduce((sum, exercise) => sum + exercise.setsDone.length, 0);
  const exercises = session.exercises.filter((exercise) => exercise.setsDone.length > 0).length;
  const next: GameState = {
    ...state,
    workoutHistory: [`D${state.day} · ${session.name} · ${exercises} exercises · ${sets} sets · ${marker}`, ...state.workoutHistory].slice(0, 100),
    xp: state.xp + Math.min(40, 10 + sets * 2),
    stability: clamp(state.stability + (sets > 0 ? 3 : 0)),
    stats: { ...state.stats, body: clamp(state.stats.body + (sets > 0 ? 2 : 0)) },
    flags: {
      ...state.flags,
      "training.completed": sets > 0,
      "training.structured": true,
    },
    journey: {
      ...state.journey,
      firstRealActionDone: sets > 0 || state.journey.firstRealActionDone,
      firstArcCompleted: state.journey.firstChoiceMade && (sets > 0 || state.journey.firstRealActionDone),
    },
    consequenceLog: sets > 0 ? [
      state.lang === "ru"
        ? `Тренировка завершена: ${exercises} упр., ${sets} подходов. Meridian изменил след тела.`
        : `Workout completed: ${exercises} exercises, ${sets} sets. Meridian changed the body trace.`,
      ...state.consequenceLog,
    ].slice(0, 40) : state.consequenceLog,
  };
  persistStoredSave(storage, next, next.lang);
  return next;
}
