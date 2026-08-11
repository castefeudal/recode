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

export function normalizeProfile(value: unknown): UserProfile {
  if (!value || typeof value !== "object") return { ...DEFAULT_PROFILE, enabledModules: [...DEFAULT_PROFILE.enabledModules] };
  const input = value as Partial<UserProfile>;
  const goals = Object.keys(goalMeta) as GoalKey[];
  const allowedMinutes = [5, 10, 20, 30, 45, 60] as const;
  const allowedModules: ModuleKey[] = ["training", "recovery", "nutrition", "mind", "focus"];
  return {
    schemaVersion: 1,
    primaryGoal: goals.includes(input.primaryGoal as GoalKey) ? input.primaryGoal as GoalKey : DEFAULT_PROFILE.primaryGoal,
    availableMinutes: allowedMinutes.includes(input.availableMinutes as typeof allowedMinutes[number]) ? input.availableMinutes as UserProfile["availableMinutes"] : DEFAULT_PROFILE.availableMinutes,
    enabledModules: Array.isArray(input.enabledModules)
      ? input.enabledModules.filter((module): module is ModuleKey => allowedModules.includes(module as ModuleKey))
      : [...DEFAULT_PROFILE.enabledModules],
  };
}

const priorityModule: Partial<Record<Priority, ModuleKey>> = {
  recovery: "recovery",
  body: "training",
  balance: "nutrition",
  mind: "mind",
  focus: "focus",
};

export function applyProfileToRecommendation(recommendation: DailyRecommendation, profile: UserProfile, lang: Lang): DailyRecommendation {
  const ru = lang === "ru";
  let adjusted = recommendation;

  // Goal is a tie-breaker only when history is sparse and there is no low-readiness
  // recovery override. Strong current-state signals remain more important than intent.
  if (recommendation.confidence === "baseline" && recommendation.readinessState !== "low" && recommendation.priority !== "recovery") {
    const goal = goalMeta[profile.primaryGoal];
    const goalModule = priorityModule[goal.priority];
    if (!goalModule || profile.enabledModules.includes(goalModule)) {
      const action = goalAction[profile.primaryGoal];
      adjusted = {
        ...recommendation,
        priority: goal.priority,
        actionId: action.actionId,
        title: action[lang],
        minutes: action.minutes,
        reason: ru
          ? `Истории пока мало, поэтому выбранная цель «${goal.ru}» используется как прозрачный приоритет по умолчанию.`
          : `History is still limited, so your selected goal “${goal.en}” is used as a transparent default priority.`,
        signals: [...recommendation.signals, `goal:${profile.primaryGoal}`],
      };
    }
  }

  const module = priorityModule[adjusted.priority];
  const moduleDisabled = module ? !profile.enabledModules.includes(module) : false;
  if (moduleDisabled) {
    adjusted = {
      ...adjusted,
      priority: "focus",
      actionId: "plan",
      title: ru ? "Уменьшить, не отменяя" : "Reduce, do not cancel",
      minutes: Math.min(6, profile.availableMinutes),
      reason: ru
        ? `Модуль ${module} отключён в твоём профиле. RECODE не будет навязывать его и предлагает нейтральное действие по системе.`
        : `The ${module} module is disabled in your profile. RECODE will not keep pushing it and uses a neutral system action instead.`,
      signals: [...adjusted.signals, `module_disabled:${module}`],
    };
  }

  const minutes = Math.max(3, Math.min(adjusted.minutes, profile.availableMinutes));
  const timeAdjusted = minutes < adjusted.minutes;
  const alternatives = adjusted.alternatives.map((alternative) => ({
    ...alternative,
    minutes: alternative.minutes > 0 ? Math.min(alternative.minutes, profile.availableMinutes) : 0,
  }));

  if (!timeAdjusted) return { ...adjusted, alternatives };
  return {
    ...adjusted,
    minutes,
    alternatives,
    reason: `${adjusted.reason} ${ru ? `Сегодня доступно около ${profile.availableMinutes} минут, поэтому масштаб уменьшен.` : `You have about ${profile.availableMinutes} minutes available today, so the action was resized.`}`,
    signals: [...adjusted.signals, `available_minutes:${profile.availableMinutes}`],
  };
}
