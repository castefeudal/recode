import type { GameState, Lang } from "../game";
import { migrateSave } from "../game";

export const SAVE_KEY = "markovmade-recode-v6";
export const BACKUP_KEY = "markovmade-recode-v6-backup";
const LEGACY_KEYS = [
  "markovmade-recode-v5", "markovmade-recode-v5-backup",
  "markovmade-recode-v4", "markovmade-recode-v4-backup", "markovmade-recode-v3",
] as const;
export const ALL_SAVE_KEYS = [SAVE_KEY, BACKUP_KEY, ...LEGACY_KEYS] as const;

export type LoadResult = { state: GameState | null; recovered: boolean };

export function loadStoredSave(storage: Storage): LoadResult {
  for (const key of ALL_SAVE_KEYS) {
    const raw = storage.getItem(key);
    if (!raw) continue;
    try {
      const parsed = migrateSave(JSON.parse(raw));
      if (parsed) return { state: parsed, recovered: key !== SAVE_KEY };
    } catch {
      // Continue to the next atomic/legacy copy.
    }
  }
  return { state: null, recovered: false };
}

export function persistStoredSave(storage: Storage, state: GameState, lang: Lang): void {
  const current = storage.getItem(SAVE_KEY);
  if (current) storage.setItem(BACKUP_KEY, current);
  storage.setItem(SAVE_KEY, JSON.stringify({
    ...state,
    lang,
    saveMeta: { ...state.saveMeta, updatedAt: new Date().toISOString() },
  }));
}

export function clearStoredSaves(storage: Storage): void {
  for (const key of ALL_SAVE_KEYS) storage.removeItem(key);
}
