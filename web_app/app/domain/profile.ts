import type { Lang } from "../game";
import type { DailyRecommendation, Priority } from "./recommendation";

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
  enabledModules: ["training", "recovery", "mind", "focus"],
};

export const goalMeta: Record<GoalKey, { ru: string; en: string; priority: Priority }> = {
  fitness: { ru: "Вернуть форму", en: "Restore fitness", priority: "body" },
  energy: { ru: "Улучшить энергию", en: "Improve energy", priority: "recovery" },
  system: { ru: "Собрать систему", en: "Build a system", priority: "focus" },
  stress: { ru: "Снизить перегруз", en: "Reduce overload", priority: "mind" },
  discipline: { ru: "Укрепить дисциплину", en: "Build discipline", priority: "focus" },
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
  const module = priorityModule[recommendation.priority];
  const moduleDisabled = module ? !profile.enabledModules.includes(module) : false;
  const minutes = Math.min(recommendation.minutes, profile.availableMinutes);
  const timeAdjusted = minutes < recommendation.minutes;
  const ru = lang === "ru";

  if (moduleDisabled) {
    return {
      ...recommendation,
      priority: "focus",
      actionId: "plan",
      title: ru ? "Уменьшить, не отменяя" : "Reduce, do not cancel",
      minutes: Math.min(6, profile.availableMinutes),
      reason: ru
        ? `Модуль ${module} отключён в твоём профиле. RECODE не будет навязывать его и предлагает нейтральное действие по системе.`
        : `The ${module} module is disabled in your profile. RECODE will not keep pushing it and uses a neutral system action instead.`,
      signals: [...recommendation.signals, `module_disabled:${module}`],
    };
  }

  if (!timeAdjusted) return recommendation;
  return {
    ...recommendation,
    minutes: Math.max(3, minutes),
    reason: `${recommendation.reason} ${ru ? `Сегодня доступно около ${profile.availableMinutes} минут, поэтому масштаб уменьшен.` : `You have about ${profile.availableMinutes} minutes available today, so the action was resized.`}`,
    signals: [...recommendation.signals, `available_minutes:${profile.availableMinutes}`],
  };
}
