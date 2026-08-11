import type { GameState, Lang, SleepEntry } from "../game";

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
  const bedMinutes = Number(bed[1]) * 60 + Number(bed[2]);
  const wakeMinutes = Number(waking[1]) * 60 + Number(waking[2]);
  if (bedMinutes < 0 || bedMinutes >= 1440 || wakeMinutes < 0 || wakeMinutes >= 1440) return null;
  const duration = wakeMinutes >= bedMinutes ? wakeMinutes - bedMinutes : 1440 - bedMinutes + wakeMinutes;
  return duration > 0 && duration <= 16 * 60 ? duration : null;
}

export function assessRecovery(state: GameState, lang: Lang): RecoveryAssessment {
  const latest: SleepEntry | undefined = state.sleepEntries[0];
  const duration = latest ? sleepDurationMinutes(latest.bedtime, latest.wake) : null;
  const quality = latest?.quality ?? null;
  const energy = state.stats.energy;
  const ru = lang === "ru";
  const factors: string[] = [];

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

  const below = (duration !== null && duration < 6 * 60) || quality <= 4 || energy < 30;
  const strong = duration !== null && duration >= 7 * 60 && quality >= 7 && energy >= 60;
  const band: RecoveryBand = below ? "below" : strong ? "strong" : "normal";

  if (!factors.length) factors.push(ru ? "Нет выраженного сигнала перегруза в доступных данных." : "No strong overload signal appears in the available data.");

  const adjustment = band === "below"
    ? (ru ? "Сегодня уменьши объём или сложность. Цель — сохранить цикл, а не компенсировать недосып усилием." : "Reduce volume or difficulty today. Preserve the loop rather than compensating for poor sleep with more effort.")
    : band === "strong"
      ? (ru ? "Обычная нагрузка допустима при нормальном самочувствии; дополнительная нагрузка не требуется ради цифры." : "Normal load is reasonable if you feel well; extra load is not required to chase a score.")
      : (ru ? "Сохрани обычный масштаб и корректируй его по фактическому самочувствию." : "Keep your normal scale and adjust it to how you actually feel.");

  return { band, sleepMinutes: duration, quality, energy, factors, adjustment, hasEnoughData: true };
}
