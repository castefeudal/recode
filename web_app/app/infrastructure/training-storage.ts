import { EMPTY_TRAINING_STATE, normalizeTrainingState, type TrainingState } from "../domain/training";

export const TRAINING_KEY = "markovmade-recode-training-v1";
export const TRAINING_BACKUP_KEY = "markovmade-recode-training-v1-backup";

export function loadTrainingState(storage: Storage): TrainingState {
  for (const key of [TRAINING_KEY, TRAINING_BACKUP_KEY]) {
    const raw = storage.getItem(key);
    if (!raw) continue;
    try {
      return normalizeTrainingState(JSON.parse(raw));
    } catch {
      // Try the backup copy.
    }
  }
  return { ...EMPTY_TRAINING_STATE };
}

export function persistTrainingState(storage: Storage, state: TrainingState): void {
  const current = storage.getItem(TRAINING_KEY);
  if (current) storage.setItem(TRAINING_BACKUP_KEY, current);
  storage.setItem(TRAINING_KEY, JSON.stringify(state));
}

export function clearTrainingState(storage: Storage): void {
  storage.removeItem(TRAINING_KEY);
  storage.removeItem(TRAINING_BACKUP_KEY);
}
