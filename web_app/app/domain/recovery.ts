import type { GameState, Lang, SleepEntry } from "../game.ts";

export type RecoveryBand = "below" | "normal" | "strong" | "insufficient";

export type RecoveryAssessment = {
  band: RecoveryBand;
  sleepMinutes: number | null;
  quality: number | null;
  energy: number;
  factors: string[];
  adjustment: string;
  hasEnoughData: boolean;
};

export function sleepDurationMinutes(bedtime: string, wake: string): number | null {
  const pattern = /^(\d{2}):(\d{2})$/;
  const bed = pattern.exec(bedtime);
  const waking = pattern.exec(wake);
  if (!bed || !waking) return null;
  const bedHour = Number(bed[1]);
  const bedMinute = Number(bed[2]);
  const wakeHour = Number(waking[1]);
  const wakeMinute = Number(waking[2]);
  if (bedHour > 23 || wakeHour > 23 || bedMinute > 59 || wakeMinute > 59) return null;
  const bedMinutes = bedHour * 60 + bedMinute;
  const wakeMinutes = wakeHour * 60 + wakeMinute;
  const duration = wakeMinutes >= bedMinutes ? wakeMinutes - bedMinutes : 1440 - bedMinutes + wakeMinutes;
  return duration > 0 && duration <= 16 * 60 ? duration : null;
}

export function upsertSleepEntry(entries: SleepEntry[], entry: SleepEntry): SleepEntry[] {
  return [entry, ...entries.filter((item) => item.day !== entry.day)]
    .sort((a, b) => b.day - a.day)
    .slice(0, 60);
}

function previousDaySignals(state: GameState): { workouts: number; completedActions: number } {
  const previousDay = Math.max(1, state.day - 1);
  const workouts = state.workoutHistory.filter((item) => {
    const match = /^D(\d+)/.exec(item);
    return match ? Number(match[1]) === previousDay : false;
  }).length;
  const completedActions = state.dailyRecords.filter((record) => record.day === previousDay && ["completed", "reduced", "replaced"].includes(record.status)).length;
  return { workouts, completedActions };
}

export function assessRecovery(state: GameState, lang: Lang): RecoveryAssessment {
  const latest: SleepEntry | undefined = state.sleepEntries[0];
  const duration = latest ? sleepDurationMinutes(latest.bedtime, latest.wake) : null;
  const quality = latest?.quality ?? null;
  const energy = state.stats.energy;
  const ru = lang === "ru";
  const factors: string[] = [];
  const previous = previousDaySignals(state);

  if (!latest) {
    return {
      band: "insufficient",
      sleepMinutes: null,
      quality: null,
      energy,
      factors: [ru ? "Нет свежей записи сна." : "No recent sleep entry."],
      adjustment: ru
        ? "Используется базовый протокол. Добавь сон, если хочешь более точную адаптацию."
        : "A baseline protocol is used. Add sleep data if you want more specific adaptation.",
      hasEnoughData: false,
    };
  }

  if (duration !== null && duration < 6 * 60) factors.push(ru ? "Сон был короче 6 часов." : "Sleep was shorter than 6 hours.");
  else if (duration !== null && duration < 7 * 60) factors.push(ru ? "Сон был короче 7 часов." : "Sleep was shorter than 7 hours.");
  if (quality <= 5) factors.push(ru ? `Субъективное качество сна ${quality}/10.` : `Subjective sleep quality was ${quality}/10.`);
  if (energy < 35) factors.push(ru ? `Текущая энергия ${energy}/100.` : `Current energy is ${energy}/100.`);
  if (previous.workouts > 0) factors.push(ru ? "Вчера записана тренировка." : "A workout was recorded yesterday.");
  if (previous.completedActions >= 3) factors.push(ru ? "Вчера было несколько завершённых действий." : "Several completed actions were recorded yesterday.");

  const below = (duration !== null && duration < 6 * 60) || quality <= 4 || energy < 30;
  const strong = duration !== null && duration >= 7 * 60 && quality >= 7 && energy >= 60;
  const band: RecoveryBand = below ? "below" : strong ? "strong" : "normal";

  if (!factors.length) factors.push(ru ? "Нет выраженного сигнала перегруза в доступных данных." : "No strong overload signal appears in the available data.");

  const recentLoad = previous.workouts > 0 || previous.completedActions >= 3;
  const adjustment = band === "below"
    ? (ru
        ? `Сегодня уменьши объём или сложность. Цель — сохранить цикл, а не компенсировать слабое восстановление усилием.${recentLoad ? " Вчерашняя нагрузка усиливает аргумент за консервативный масштаб." : ""}`
        : `Reduce volume or difficulty today. Preserve the loop rather than compensating for weak recovery with more effort.${recentLoad ? " Yesterday's recorded load strengthens the case for a conservative scale." : ""}`)
    : band === "strong"
      ? (ru ? "Обычная нагрузка допустима при нормальном самочувствии; дополнительная нагрузка не требуется ради цифры." : "Normal load is reasonable if you feel well; extra load is not required to chase a score.")
      : (ru ? "Сохрани обычный масштаб и корректируй его по фактическому самочувствию." : "Keep your normal scale and adjust it to how you actually feel.");

  return { band, sleepMinutes: duration, quality, energy, factors, adjustment, hasEnoughData: true };
}
