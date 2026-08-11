import type { GameState, Lang } from "../game.ts";

export type WeeklyProgress = {
  startDay: number;
  endDay: number;
  completed: number;
  adapted: number;
  skipped: number;
  returns: number;
  workouts: number;
  averageSleepQuality: number | null;
};

export type ProgressInsight = {
  weeks: WeeklyProgress[];
  totalCompleted: number;
  totalAdapted: number;
  totalReturns: number;
  totalWorkouts: number;
  sleepSamples: number;
  averageSleepQuality: number | null;
  storyScenes: number;
  decision: string;
  confidence: "insufficient" | "observed";
};

function workoutDay(entry: string): number | null {
  const match = /^D(\d+)/.exec(entry);
  return match ? Number(match[1]) : null;
}

export function weeklyProgress(state: GameState, weeks = 4): WeeklyProgress[] {
  const safeWeeks = Math.max(1, Math.min(12, Math.floor(weeks)));
  const result: WeeklyProgress[] = [];
  for (let offset = safeWeeks - 1; offset >= 0; offset -= 1) {
    const endDay = Math.max(1, state.day - offset * 7);
    const startDay = Math.max(1, endDay - 6);
    const records = state.dailyRecords.filter((record) => record.day >= startDay && record.day <= endDay);
    const actions = records.filter((record) => record.actionId !== "return");
    const returns = records.filter((record) => record.actionId === "return" && record.status === "completed").length;
    const sleeps = state.sleepEntries.filter((entry) => entry.day >= startDay && entry.day <= endDay);
    const averageSleepQuality = sleeps.length
      ? Math.round((sleeps.reduce((sum, entry) => sum + entry.quality, 0) / sleeps.length) * 10) / 10
      : null;
    const workouts = state.workoutHistory.filter((entry) => {
      const day = workoutDay(entry);
      return day !== null && day >= startDay && day <= endDay;
    }).length;
    result.push({
      startDay,
      endDay,
      completed: actions.filter((record) => record.status === "completed").length,
      adapted: actions.filter((record) => record.status === "reduced" || record.status === "replaced").length,
      skipped: actions.filter((record) => record.status === "skipped").length,
      returns,
      workouts,
      averageSleepQuality,
    });
  }
  return result;
}

export function buildProgressInsight(state: GameState, lang: Lang): ProgressInsight {
  const weeks = weeklyProgress(state, 4);
  const recent = weeks.at(-1)!;
  const previous = weeks.at(-2) ?? null;
  const sleepSamples = state.sleepEntries.filter((entry) => entry.day >= Math.max(1, state.day - 27) && entry.day <= state.day).length;
  const sleepValues = weeks.map((week) => week.averageSleepQuality).filter((value): value is number => value !== null);
  const averageSleepQuality = sleepValues.length
    ? Math.round((sleepValues.reduce((sum, value) => sum + value, 0) / sleepValues.length) * 10) / 10
    : null;
  const enoughActionData = recent.completed + recent.adapted + recent.skipped >= 3;
  const confidence: ProgressInsight["confidence"] = enoughActionData || sleepSamples >= 4 || recent.workouts >= 2 ? "observed" : "insufficient";
  const ru = lang === "ru";

  let decision = ru
    ? "Данных пока мало. Сначала запиши несколько реальных действий — вывод появится только после наблюдаемой истории."
    : "There is not enough data yet. Record several real actions first; a conclusion appears only after observable history exists.";

  if (confidence === "observed") {
    if (averageSleepQuality !== null && averageSleepQuality < 5.5) {
      decision = ru
        ? "Восстановление остаётся слабым сигналом. На следующей неделе не увеличивай объём раньше, чем стабилизируется сон и субъективная энергия."
        : "Recovery remains a weak signal. Do not increase volume next week before sleep and subjective energy become more stable.";
    } else if (recent.skipped > recent.completed + recent.adapted) {
      decision = ru
        ? "Текущий масштаб часто не запускается. Уменьши стандартный Next Best Action до размера, который реально начинается."
        : "The current scale often fails to start. Reduce the default Next Best Action to a size you actually begin.";
    } else if (recent.adapted > recent.completed && recent.adapted >= 2) {
      decision = ru
        ? "Адаптация работает: ты чаще уменьшаешь действие, чем отменяешь цикл. Не повышай масштаб автоматически — сначала закрепи повторяемость."
        : "Adaptation is working: you reduce actions instead of cancelling the loop. Do not raise the scale automatically; stabilize repeatability first.";
    } else if (previous && recent.completed > previous.completed) {
      decision = ru
        ? "Завершённых действий стало больше. Сохрани текущий масштаб ещё одну неделю прежде, чем добавлять сложность."
        : "Completed actions increased. Keep the current scale for another week before adding complexity.";
    } else {
      decision = ru
        ? "Траектория достаточно стабильна для продолжения текущего протокола. Меняй только один фактор за раз, если хочешь понять его эффект."
        : "The trajectory is stable enough to continue the current protocol. Change one factor at a time if you want to understand its effect.";
    }
  }

  return {
    weeks,
    totalCompleted: weeks.reduce((sum, week) => sum + week.completed, 0),
    totalAdapted: weeks.reduce((sum, week) => sum + week.adapted, 0),
    totalReturns: weeks.reduce((sum, week) => sum + week.returns, 0),
    totalWorkouts: weeks.reduce((sum, week) => sum + week.workouts, 0),
    sleepSamples,
    averageSleepQuality,
    storyScenes: state.completedScenes.length,
    decision,
    confidence,
  };
}
