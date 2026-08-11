import type { GameState, Lang } from "../game";
import { getDailyRecommendation } from "./recommendation";

export type TrendDirection = "up" | "down" | "flat" | "insufficient";

export type WeeklyReview = {
  week: number;
  completedActions: number;
  reducedActions: number;
  skippedActions: number;
  returns: number;
  workouts: number;
  sleepTrend: TrendDirection;
  averageSleepQuality: number | null;
  wins: string[];
  friction: string[];
  observation: string | null;
  nextFocus: string;
  disclaimer: string;
};

function trend(values: number[]): TrendDirection {
  if (values.length < 4) return "insufficient";
  const midpoint = Math.floor(values.length / 2);
  const first = values.slice(midpoint).reduce((sum, value) => sum + value, 0) / values.slice(midpoint).length;
  const second = values.slice(0, midpoint).reduce((sum, value) => sum + value, 0) / values.slice(0, midpoint).length;
  if (second - first >= 0.75) return "up";
  if (first - second >= 0.75) return "down";
  return "flat";
}

export function buildWeeklyReview(state: GameState, lang: Lang): WeeklyReview {
  const startDay = Math.max(1, state.day - 6);
  const records = state.dailyRecords.filter((record) => record.day >= startDay && record.day <= state.day);
  const completedActions = records.filter((record) => record.status === "completed").length;
  const reducedActions = records.filter((record) => record.status === "reduced" || record.status === "replaced").length;
  const skippedActions = records.filter((record) => record.status === "skipped").length;
  const sleeps = state.sleepEntries.filter((entry) => entry.day >= startDay && entry.day <= state.day);
  const sleepQualities = sleeps.map((entry) => entry.quality);
  const averageSleepQuality = sleepQualities.length
    ? Math.round((sleepQualities.reduce((sum, value) => sum + value, 0) / sleepQualities.length) * 10) / 10
    : null;
  const workouts = state.workoutHistory.filter((entry) => {
    const match = /^D(\d+)/.exec(entry);
    return match ? Number(match[1]) >= startDay : false;
  }).length;

  const copy = lang === "ru" ? {
    completed: (count: number) => `${count} действий завершено полностью.`,
    adapted: (count: number) => `${count} раз ты уменьшил или заменил действие вместо отмены.`,
    returnWin: (count: number) => `${count} возвратов после пропусков сохранены как отдельный прогресс.`,
    skipped: (count: number) => `${count} честных пропусков — проверь, что чаще всего мешало начать.`,
    sleepLow: "Восстановление выглядит главным ограничением недели.",
    noData: "Недостаточно данных для устойчивого поведенческого наблюдения.",
    association: "В этой неделе после более слабых записей сна чаще встречались уменьшенные или пропущенные действия.",
    disclaimer: "Наблюдаемая связь внутри твоих записей; это не доказательство причинности.",
  } : {
    completed: (count: number) => `${count} actions were completed in full.`,
    adapted: (count: number) => `${count} times you reduced or replaced an action instead of cancelling it.`,
    returnWin: (count: number) => `${count} returns after missed days are preserved as progress.`,
    skipped: (count: number) => `${count} honest skips — review what most often blocked starting.`,
    sleepLow: "Recovery looks like the main constraint this week.",
    noData: "There is not enough history for a stable behavioural observation yet.",
    association: "This week, weaker sleep entries coincided more often with reduced or skipped actions.",
    disclaimer: "This is an observed association in your own records, not evidence of causation.",
  };

  const wins: string[] = [];
  if (completedActions) wins.push(copy.completed(completedActions));
  if (reducedActions) wins.push(copy.adapted(reducedActions));
  if (state.returns) wins.push(copy.returnWin(state.returns));

  const friction: string[] = [];
  if (skippedActions) friction.push(copy.skipped(skippedActions));
  if (averageSleepQuality !== null && averageSleepQuality < 5.5) friction.push(copy.sleepLow);

  const lowSleepDays = new Set(sleeps.filter((entry) => entry.quality <= 5).map((entry) => entry.day));
  const adaptedOnLowSleep = records.filter((record) => lowSleepDays.has(record.day) && ["reduced", "replaced", "skipped"].includes(record.status)).length;
  const observation = lowSleepDays.size >= 2 && adaptedOnLowSleep >= 2 ? copy.association : null;
  const recommendation = getDailyRecommendation(state, lang);

  return {
    week: Math.max(1, Math.ceil(state.day / 7)),
    completedActions,
    reducedActions,
    skippedActions,
    returns: state.returns,
    workouts,
    sleepTrend: trend(sleepQualities),
    averageSleepQuality,
    wins: wins.length ? wins : [copy.noData],
    friction,
    observation,
    nextFocus: recommendation.title,
    disclaimer: copy.disclaimer,
  };
}
