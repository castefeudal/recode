import type { GameState, Lang } from "../game.ts";

export type ReturnScale = "minimum" | "standard" | "full";

export type ReturnOption = {
  scale: ReturnScale;
  minutes: number;
  label: string;
  effect: { stability: number; focus: number; xp: number };
};

export type ReturnProtocol = {
  active: boolean;
  daysAway: number;
  title: string;
  message: string;
  options: ReturnOption[];
};

export function getReturnProtocol(state: GameState, lang: Lang, daysSinceLastUse = 0): ReturnProtocol {
  const daysAway = Math.max(0, Math.floor(daysSinceLastUse));
  const active = daysAway >= 2;
  const ru = lang === "ru";
  return {
    active,
    daysAway,
    title: ru ? `${daysAway} дн. вне системы` : `${daysAway} days away`,
    message: ru
      ? "Прогресс сохранён. Выбери реалистичный масштаб возвращения — система не требует наверстывать пропущенное."
      : "Your progress is intact. Choose a realistic return scale; the system does not ask you to make up missed work.",
    options: [
      { scale: "minimum", minutes: 3, label: ru ? "Минимальный" : "Minimum", effect: { stability: 2, focus: 0, xp: 6 } },
      { scale: "standard", minutes: 10, label: ru ? "Стандартный" : "Standard", effect: { stability: 4, focus: 1, xp: 14 } },
      { scale: "full", minutes: 25, label: ru ? "Полный" : "Full", effect: { stability: 5, focus: 1, xp: 20 } },
    ],
  };
}

export function applyReturn(state: GameState, scale: ReturnScale): GameState {
  const option = getReturnProtocol(state, state.lang, 2).options.find((item) => item.scale === scale);
  if (!option) return state;
  return {
    ...state,
    returns: state.returns + 1,
    stability: Math.min(100, state.stability + option.effect.stability),
    focus: Math.min(6, state.focus + option.effect.focus),
    xp: state.xp + option.effect.xp,
    flags: {
      ...state.flags,
      "return.completed": true,
      [`return.${scale}`]: true,
    },
    consequenceLog: [
      state.lang === "ru"
        ? `Возвращение зафиксировано: ${option.minutes} минут. Meridian запомнил не пропуск, а возврат.`
        : `Return recorded: ${option.minutes} minutes. Meridian remembers the return, not the absence.`,
      ...state.consequenceLog,
    ].slice(0, 40),
  };
}
