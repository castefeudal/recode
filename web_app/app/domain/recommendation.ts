import { dailyActions, type ActionStatus, type GameState, type Lang, type StatKey } from "../game";
import { assessRecovery } from "./recovery";

export type Priority = "recovery" | "body" | "focus" | "balance" | "mind" | "connections";
export type ReadinessState = "low" | "moderate" | "ready";
export type RecommendationConfidence = "baseline" | "moderate" | "high";

export type DailyRecommendation = {
  priority: Priority;
  readinessState: ReadinessState;
  actionId: string;
  minutes: number;
  title: string;
  reason: string;
  confidence: RecommendationConfidence;
  alternatives: Array<{ status: ActionStatus; minutes: number; label: string }>;
  signals: string[];
};

const localized = {
  ru: {
    baseline: "Пока данных мало: используется базовая рекомендация на основе текущего состояния.",
    lowSleep: "Восстановление сейчас ограничивает допустимый масштаб нагрузки.",
    lowEnergy: "Энергия сейчас является одним из самых слабых ограничений.",
    lowBalance: "Баланс нагрузки и восстановления сейчас просел сильнее других направлений.",
    lowBody: "Физическая активность сейчас является наиболее слабым направлением.",
    lowMind: "Сейчас полезнее сначала уменьшить внутреннее напряжение и прояснить следующий шаг.",
    lowConnections: "Связи сейчас являются наиболее слабым направлением; короткий честный контакт даст больше пользы, чем ещё одна задача.",
    lowDiscipline: "Главное ограничение сейчас — не объём усилий, а завершение одного реалистичного обязательства.",
    reduced: "Уменьшить",
    replaced: "Заменить",
    deferred: "Перенести",
    skipped: "Пропустить честно",
  },
  en: {
    baseline: "There is not enough history yet, so this is a baseline recommendation based on your current state.",
    lowSleep: "Recovery is currently limiting the reasonable scale of today's load.",
    lowEnergy: "Energy is currently one of your strongest constraints.",
    lowBalance: "Load and recovery balance is currently lagging behind your other domains.",
    lowBody: "Physical activity is currently your weakest domain.",
    lowMind: "Reducing tension and clarifying one next action is more useful than adding more load right now.",
    lowConnections: "Connection is currently your weakest domain; one honest contact is likely more useful than another task.",
    lowDiscipline: "The main constraint is not effort volume but completing one realistic commitment.",
    reduced: "Reduce",
    replaced: "Replace",
    deferred: "Defer",
    skipped: "Skip honestly",
  },
} as const;

function weakestStat(state: GameState): StatKey {
  const keys = Object.keys(state.stats) as StatKey[];
  return keys.reduce((weakest, key) => state.stats[key] < state.stats[weakest] ? key : weakest);
}

function actionFor(priority: Priority) {
  const id = priority === "recovery" ? "sleep"
    : priority === "body" ? "move"
    : priority === "balance" ? "meal"
    : priority === "mind" ? "truth"
    : priority === "connections" ? "contact"
    : "plan";
  return dailyActions.find((action) => action.id === id) ?? dailyActions[0];
}

export function getDailyRecommendation(state: GameState, lang: Lang): DailyRecommendation {
  const copy = localized[lang];
  const weak = weakestStat(state);
  const recovery = assessRecovery(state, lang);
  const historyCount = state.dailyRecords.length + state.sleepEntries.length + state.workoutHistory.length;
  const signals: string[] = [];

  let priority: Priority;
  let reason: string;

  if (recovery.band === "below" || state.stats.energy < 32) {
    priority = "recovery";
    reason = recovery.band === "below" ? `${copy.lowSleep} ${recovery.factors[0] ?? ""}`.trim() : copy.lowEnergy;
    if (recovery.sleepMinutes !== null) signals.push(`sleep_minutes:${recovery.sleepMinutes}`);
    if (recovery.quality !== null) signals.push(`sleep_quality:${recovery.quality}/10`);
    signals.push(`energy:${state.stats.energy}`);
  } else if (weak === "body") {
    priority = "body";
    reason = copy.lowBody;
    signals.push(`body:${state.stats.body}`);
  } else if (weak === "balance") {
    priority = "balance";
    reason = copy.lowBalance;
    signals.push(`balance:${state.stats.balance}`);
  } else if (weak === "mind") {
    priority = "mind";
    reason = copy.lowMind;
    signals.push(`mind:${state.stats.mind}`);
  } else if (weak === "connections") {
    priority = "connections";
    reason = copy.lowConnections;
    signals.push(`connections:${state.stats.connections}`);
  } else {
    priority = "focus";
    reason = copy.lowDiscipline;
    signals.push(`discipline:${state.stats.discipline}`);
  }

  const readinessState: ReadinessState = recovery.band === "below" || state.stats.energy < 30
    ? "low"
    : recovery.band === "normal" || state.stats.energy < 50 || state.stats.balance < 40
      ? "moderate"
      : "ready";

  const baseAction = actionFor(priority);
  const minutes = readinessState === "low"
    ? Math.max(3, Math.min(6, baseAction.minutes))
    : readinessState === "moderate"
      ? Math.max(3, Math.round(baseAction.minutes * 0.75))
      : baseAction.minutes;

  const confidence: RecommendationConfidence = historyCount >= 14 ? "high" : historyCount >= 5 ? "moderate" : "baseline";
  const title = baseAction.title[lang];

  return {
    priority,
    readinessState,
    actionId: baseAction.id,
    minutes,
    title,
    reason: confidence === "baseline" ? `${reason} ${copy.baseline}` : reason,
    confidence,
    signals,
    alternatives: [
      { status: "reduced", minutes: Math.max(3, Math.round(minutes * 0.5)), label: copy.reduced },
      { status: "replaced", minutes, label: copy.replaced },
      { status: "deferred", minutes: 0, label: copy.deferred },
      { status: "skipped", minutes: 0, label: copy.skipped },
    ],
  };
}
