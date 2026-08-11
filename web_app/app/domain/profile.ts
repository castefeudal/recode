import type { Lang } from "../game.ts";
import type { DailyRecommendation, Priority } from "./recommendation.ts";

export type GoalKey = "fitness" | "energy" | "system" | "stress" | "discipline";
export type ModuleKey = "training" | "recovery" | "nutrition" | "mind" | "focus";

export type UserProfile = {
  schemaVersion: 1;
  primaryGoal: GoalKey;
  availableMinutes: 5 | 10 | 20 | 30 | 45 | 60;
  enabledModules: ModuleKey[];
};

export const DEFAULT_PROFILE: UserProfile = {
  schemaVersion: 1,
  primaryGoal: "system",
  availableMinutes: 10,
  enabledModules: ["training", "recovery", "nutrition", "mind", "focus"],
};

export const goalMeta: Record<GoalKey, { ru: string; en: string; priority: Priority }> = {
  fitness: { ru: "Вернуть форму", en: "Restore fitness", priority: "body" },
  energy: { ru: "Улучшить энергию", en: "Improve energy", priority: "recovery" },
  system: { ru: "Собрать систему", en: "Build a system", priority: "focus" },
  stress: { ru: "Снизить перегруз", en: "Reduce overload", priority: "mind" },
  discipline: { ru: "Укрепить дисциплину", en: "Build discipline", priority: "focus" },
};

const goalAction: Record<GoalKey, { actionId: string; ru: string; en: string; minutes: number }> = {
  fitness: { actionId: "move", ru: "Десять точных минут", en: "Ten precise minutes", minutes: 10 },
  energy: { actionId: "sleep", ru: "Закрыть день вовремя", en: "Close the day on time", minutes: 4 },
  system: { actionId: "plan", ru: "Уменьшить, не отменяя", en: "Reduce, do not cancel", minutes: 6 },
  stress: { actionId: "truth", ru: "Назвать препятствие", en: "Name the obstacle", minutes: 3 },
  discipline: { actionId: "plan", ru: "Уменьшить, не отменяя", en: "Reduce, do not cancel", minutes: 6 },
};

const moduleAction: Record<ModuleKey, { priority: Priority; actionId: string; ru: string; en: string; minutes: number }> = {
  training: { priority: "body", actionId: "move", ru: "Короткое движение", en: "Short movement", minutes: 6 },
  recovery: { priority: "recovery", actionId: "sleep", ru: "Снизить нагрузку", en: "Reduce the load", minutes: 4 },
  nutrition: { priority: "balance", actionId: "meal", ru: "Собрать простой приём пищи", en: "Build a simple meal", minutes: 6 },
  mind: { priority: "mind", actionId: "truth", ru: "Назвать препятствие", en: "Name the obstacle", minutes: 3 },
  focus: { priority: "focus", actionId: "plan", ru: "Уменьшить, не отменяя", en: "Reduce, do not cancel", minutes: 6 },
};

const priorityModule: Partial<Record<Priority, ModuleKey>> = {
  recovery: "recovery",
  body: "training",
  balance: "nutrition",
  mind: "mind",
  focus: "focus",
};

function preferredFallback(enabledModules: ModuleKey[], lowReadiness: boolean): ModuleKey {
  const preference: ModuleKey[] = lowReadiness
    ? ["recovery", "focus", "mind", "nutrition", "training"]
    : ["focus", "recovery", "mind", "training", "nutrition"];
  return preference.find((module) => enabledModules.includes(module)) ?? enabledModules[0] ?? "focus";
}

export function normalizeProfile(value: unknown): UserProfile {
  if (!value || typeof value !== "object") return { ...DEFAULT_PROFILE, enabledModules: [...DEFAULT_PROFILE.enabledModules] };
  const input = value as Partial<UserProfile>;
  const goals = Object.keys(goalMeta) as GoalKey[];
  const allowedMinutes = [5, 10, 20, 30, 45, 60] as const;
  const allowedModules: ModuleKey[] = ["training", "recovery", "nutrition", "mind", "focus"];
  const filteredModules = Array.isArray(input.enabledModules)
    ? [...new Set(input.enabledModules.filter((module): module is ModuleKey => allowedModules.includes(module as ModuleKey)))]
    : [...DEFAULT_PROFILE.enabledModules];

  return {
    schemaVersion: 1,
    primaryGoal: goals.includes(input.primaryGoal as GoalKey) ? input.primaryGoal as GoalKey : DEFAULT_PROFILE.primaryGoal,
    availableMinutes: allowedMinutes.includes(input.availableMinutes as typeof allowedMinutes[number]) ? input.availableMinutes as UserProfile["availableMinutes"] : DEFAULT_PROFILE.availableMinutes,
    enabledModules: filteredModules.length ? filteredModules : [...DEFAULT_PROFILE.enabledModules],
  };
}

export function applyProfileToRecommendation(recommendation: DailyRecommendation, profile: UserProfile, lang: Lang): DailyRecommendation {
  const safeProfile = normalizeProfile(profile);
  const ru = lang === "ru";
  let adjusted = recommendation;

  // Goal is a tie-breaker only while history is sparse. Strong current-state
  // recovery signals remain more important than declared intent.
  if (recommendation.confidence === "baseline" && recommendation.readinessState !== "low" && recommendation.priority !== "recovery") {
    const goal = goalMeta[safeProfile.primaryGoal];
    const goalModule = priorityModule[goal.priority];
    if (!goalModule || safeProfile.enabledModules.includes(goalModule)) {
      const action = goalAction[safeProfile.primaryGoal];
      adjusted = {
        ...recommendation,
        priority: goal.priority,
        actionId: action.actionId,
        title: action[lang],
        minutes: action.minutes,
        reason: ru
          ? `Истории пока мало, поэтому выбранная цель «${goal.ru}» используется как прозрачный приоритет по умолчанию.`
          : `History is still limited, so your selected goal “${goal.en}” is used as a transparent default priority.`,
        signals: [...recommendation.signals, `goal:${safeProfile.primaryGoal}`],
      };
    }
  }

  const requestedModule = priorityModule[adjusted.priority];
  if (requestedModule && !safeProfile.enabledModules.includes(requestedModule)) {
    const fallbackModule = preferredFallback(safeProfile.enabledModules, adjusted.readinessState === "low");
    const fallback = moduleAction[fallbackModule];
    adjusted = {
      ...adjusted,
      priority: fallback.priority,
      actionId: fallback.actionId,
      title: fallback[lang],
      minutes: Math.min(fallback.minutes, safeProfile.availableMinutes),
      reason: ru
        ? `Модуль ${requestedModule} отключён. Вместо него используется включённый модуль ${fallbackModule}; масштаб остаётся консервативным.`
        : `The ${requestedModule} module is disabled. RECODE uses the enabled ${fallbackModule} module instead and keeps the scale conservative.`,
      signals: [...adjusted.signals, `module_disabled:${requestedModule}`, `fallback_module:${fallbackModule}`],
    };
  }

  const minutes = Math.max(3, Math.min(adjusted.minutes, safeProfile.availableMinutes));
  const timeAdjusted = minutes < adjusted.minutes;
  const alternatives = adjusted.alternatives.map((alternative) => ({
    ...alternative,
    minutes: alternative.minutes > 0 ? Math.min(alternative.minutes, safeProfile.availableMinutes) : 0,
  }));

  if (!timeAdjusted) return { ...adjusted, alternatives };
  return {
    ...adjusted,
    minutes,
    alternatives,
    reason: `${adjusted.reason} ${ru ? `Сегодня доступно около ${safeProfile.availableMinutes} минут, поэтому масштаб уменьшен.` : `You have about ${safeProfile.availableMinutes} minutes available today, so the action was resized.`}`,
    signals: [...adjusted.signals, `available_minutes:${safeProfile.availableMinutes}`],
  };
}
