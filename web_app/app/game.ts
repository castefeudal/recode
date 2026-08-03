const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export type Lang = "ru" | "en";
export type StatKey = "body" | "energy" | "balance" | "mind" | "discipline" | "connections";
export type Screen = "today" | "story" | "quests" | "body" | "nutrition" | "recovery" | "mind" | "relations" | "work" | "city" | "profile";
export type OriginKey = "lost" | "burnout" | "potential" | "return";
export type Localized = { ru: string; en: string };
export type ActionStatus = "completed" | "reduced" | "deferred" | "replaced" | "skipped";
export type Effect =
  | { stat: StatKey; delta: number }
  | { resource: "xp" | "focus" | "momentum" | "material"; delta: number }
  | { relationship: string; delta: number }
  | { flag: string; value: boolean };
export type Requirement =
  | { type: "origin"; value: OriginKey }
  | { type: "relationship"; id: string; min?: number; max?: number }
  | { type: "stat"; id: StatKey; min?: number; max?: number }
  | { type: "dominant_stat"; value: StatKey }
  | { type: "weak_stat"; value: StatKey }
  | { type: "skip_count"; min: number }
  | { type: "real_action"; id: string; value: boolean }
  | { type: "flag"; id: string; value: boolean };
export type Choice = {
  id: string; scene_id: string; text: Localized; intent: StatKey;
  immediate_effects: Effect[]; delayed_consequence_id: string | null;
  next_scene_id: string | null; cost: { resource: "focus"; amount: number };
  telegraph: Localized; requirements?: Requirement[];
  route_effect?: { open: string; close: string[] };
};
export type SceneVariant = { id: string; requirements: Requirement[]; text: Localized };
export type Scene = {
  id: string; chapter_id: string; order: number; title: Localized; beat: Localized;
  location: Localized; speaker: Localized; text: Localized; dialogue: Localized; question: Localized;
  choices: string[]; next_default: string | null; variants?: SceneVariant[];
  branch_node?: boolean; relationship_gate?: string;
  real_action: null | { minutes: number; prompt: Localized };
  content_warnings: string[];
};
export type Chapter = {
  id: string; order: number; title: Localized; thesis: Localized; dramatic_question: Localized;
  location: Localized; primary_character: Localized; first_scene_id: string; scene_count: number;
};
export type Delayed = {
  id: string; source_choice_id: string; trigger: { after_scenes: number }; text: Localized; effects: Effect[];
};
export type EndingPhase = { phase: string; title: Localized; text: Localized };
export type Ending = {
  id: string; title: Localized; priority: number; requirements: Record<string, number>;
  text: Localized; sequence: EndingPhase[];
};
export type Campaign = {
  schema_version: number; title: Localized; estimated_hours: string; authorship: string;
  design_contract: Record<string, number | string | boolean>;
  chapters: Chapter[]; scenes: Scene[]; choices: Choice[];
  delayed_consequences: Delayed[]; ending_rules: Ending[];
};

export type PendingConsequence = { id: string; dueAt: number };
export type DailyRecord = { actionId: string; status: ActionStatus; day: number };
export type FoodEntry = { id: string; meal: string; hunger: number; energy: number; day: number };
export type SleepEntry = { id: string; bedtime: string; wake: string; quality: number; day: number };
export type GameState = {
  schemaVersion: 6;
  name: string; origin: OriginKey; lang: Lang; day: number;
  currentSceneId: string | null; completedScenes: string[]; selectedChoices: string[];
  realActions: string[]; dailyRecords: DailyRecord[]; stats: Record<StatKey, number>;
  xp: number; focus: number; momentum: number; material: number; stability: number;
  streak: number; returns: number; room: number; skipCount: number;
  relationships: Record<string, number>; flags: Record<string, boolean>;
  pending: PendingConsequence[]; consequenceLog: string[]; journal: string[];
  questJournal: Record<string, ActionStatus>; activeQuestIds: string[]; completedQuestIds: string[];
  eventHistory: string[]; favoriteExercises: string[]; workoutHistory: string[];
  foodEntries: FoodEntry[]; sleepEntries: SleepEntry[];
  finance: { income: number; essentials: number; flexible: number; reserve: number };
  cloud: { consented: boolean; apiUrl: string; revision: number };
  accessibility: { reducedMotion: boolean; highContrast: boolean };
  journey: { firstChoiceMade: boolean; firstRealActionDone: boolean; firstArcCompleted: boolean };
  saveMeta: { createdAt: string; updatedAt: string; recoveryCount: number };
  endingId: string | null;
};

const EMPTY_CAMPAIGN: Campaign = {
  schema_version: 4,
  title: { ru: "MARKOVMADE: RECODE", en: "MARKOVMADE: RECODE" },
  estimated_hours: "6–8",
  authorship: "Original concept, system and authorship: Павел Марков / Pavel Markov / MARKOVMADE",
  design_contract: { critical_branch_nodes: 30, conditional_scene_variants: 89 },
  chapters: [], scenes: [], choices: [], delayed_consequences: [], ending_rules: [],
};

export let campaign = EMPTY_CAMPAIGN;
export let sceneById: Record<string, Scene> = {};
export let choiceById: Record<string, Choice> = {};
export let delayedById: Record<string, Delayed> = {};
export let chapterById: Record<string, Chapter> = {};
let campaignPromise: Promise<Campaign> | null = null;

export function loadCampaign(): Promise<Campaign> {
  if (campaign.scenes.length) return Promise.resolve(campaign);
  campaignPromise ??= fetch(`${BASE_PATH}/content/season_01.json?v=7.0.0`, { cache: "force-cache" })
    .then(async (response) => {
      if (!response.ok) throw new Error(`campaign_http_${response.status}`);
      const loaded = await response.json() as Campaign;
      if (loaded.schema_version !== 4 || loaded.scenes.length !== 140 || loaded.choices.length !== 420) {
        throw new Error("campaign_contract_invalid");
      }
      campaign = loaded;
      sceneById = Object.fromEntries(loaded.scenes.map((scene) => [scene.id, scene]));
      choiceById = Object.fromEntries(loaded.choices.map((choice) => [choice.id, choice]));
      delayedById = Object.fromEntries(loaded.delayed_consequences.map((item) => [item.id, item]));
      chapterById = Object.fromEntries(loaded.chapters.map((chapter) => [chapter.id, chapter]));
      return loaded;
    })
    .catch((error) => {
      campaignPromise = null;
      throw error;
    });
  return campaignPromise;
}

export const statMeta: Record<StatKey, { ru: string; en: string; code: string }> = {
  body: { ru: "Тело", en: "Body", code: "BDY" },
  energy: { ru: "Энергия", en: "Energy", code: "NRG" },
  balance: { ru: "Баланс", en: "Balance", code: "BAL" },
  mind: { ru: "Разум", en: "Mind", code: "MND" },
  discipline: { ru: "Дисциплина", en: "Discipline", code: "DSC" },
  connections: { ru: "Связи", en: "Connections", code: "LNK" },
};

export const origins: Array<{
  id: OriginKey; number: string; title: Localized; subtitle: Localized; description: Localized;
  tension: Localized; stats: Record<StatKey, number>;
}> = [
  { id: "lost", number: "01", title: { ru: "Потерянная форма", en: "Lost Form" }, subtitle: { ru: "Вернуться в собственное тело", en: "Return to your own body" }, description: { ru: "Режим рассыпался, а каждый новый старт превращается в наказание.", en: "The routine collapsed, and every restart becomes punishment." }, tension: { ru: "Стыд заставляет прятаться, а не действовать.", en: "Shame makes you hide instead of act." }, stats: { body: 32, energy: 43, balance: 29, mind: 48, discipline: 36, connections: 44 } },
  { id: "burnout", number: "02", title: { ru: "Выгоревший достигатор", en: "Burned-Out Achiever" }, subtitle: { ru: "Вернуть энергию без капитуляции", en: "Restore energy without surrender" }, description: { ru: "Ты умеешь работать на пределе, но перестал замечать истощение.", en: "You can work at the limit but stopped noticing exhaustion." }, tension: { ru: "Отдых кажется слабостью, пока тело не остановит тебя.", en: "Rest feels weak until the body stops you." }, stats: { body: 51, energy: 21, balance: 37, mind: 63, discipline: 71, connections: 30 } },
  { id: "potential", number: "03", title: { ru: "Несобранный потенциал", en: "Unassembled Potential" }, subtitle: { ru: "Превратить намерение в систему", en: "Turn intention into a system" }, description: { ru: "Идей больше, чем завершённых циклов. Новый план приятнее продолжения.", en: "There are more ideas than finished cycles. A new plan feels better than continuing." }, tension: { ru: "Мотивация исчезает раньше, чем появляется структура.", en: "Motivation fades before structure appears." }, stats: { body: 43, energy: 49, balance: 35, mind: 64, discipline: 23, connections: 51 } },
  { id: "return", number: "04", title: { ru: "Возвращение чемпиона", en: "The Champion Returns" }, subtitle: { ru: "Не соревноваться с прошлой версией", en: "Stop competing with your former self" }, description: { ru: "Тело помнит высокий уровень, поэтому постепенный старт кажется унижением.", en: "The body remembers a high level, so a gradual restart feels humiliating." }, tension: { ru: "Амбиция помогает вернуться — и способна снова сломать.", en: "Ambition helps you return—and can break you again." }, stats: { body: 59, energy: 38, balance: 47, mind: 42, discipline: 64, connections: 35 } },
];

export const dailyActions = [
  { id: "sleep", stat: "energy" as StatKey, minutes: 4, xp: 18, title: { ru: "Закрыть день вовремя", en: "Close the day on time" }, text: { ru: "Назначить реальное время сна и убрать один источник возбуждения.", en: "Set a realistic sleep time and remove one source of stimulation." } },
  { id: "move", stat: "body" as StatKey, minutes: 10, xp: 24, title: { ru: "Десять точных минут", en: "Ten precise minutes" }, text: { ru: "Законченная ходьба или мобильность — не разминка перед наказанием.", en: "A complete walk or mobility session—not a warm-up for punishment." } },
  { id: "meal", stat: "balance" as StatKey, minutes: 7, xp: 20, title: { ru: "Собрать один приём пищи", en: "Build one meal" }, text: { ru: "Белок, клетчатка, энергия и вода без компенсации за вчера.", en: "Protein, fibre, energy and water without compensating for yesterday." } },
  { id: "truth", stat: "mind" as StatKey, minutes: 3, xp: 16, title: { ru: "Назвать препятствие", en: "Name the obstacle" }, text: { ru: "Одна честная фраза: время, страх, усталость или протест?", en: "One honest sentence: time, fear, fatigue, or resistance?" } },
  { id: "contact", stat: "connections" as StatKey, minutes: 5, xp: 22, title: { ru: "Честное сообщение", en: "An honest message" }, text: { ru: "Попросить поддержку или спокойно обозначить границу.", en: "Ask for support or calmly state a boundary." } },
  { id: "plan", stat: "discipline" as StatKey, minutes: 6, xp: 18, title: { ru: "Уменьшить, не отменяя", en: "Reduce, do not cancel" }, text: { ru: "Пересобрать обязательство под фактические сутки.", en: "Resize one commitment for the next real day." } },
];

export function clamp(value: number): number { return Math.max(0, Math.min(100, Math.round(value))); }
function positiveDelta(value: number, delta: number): number {
  if (delta <= 0) return delta;
  if (value >= 90) return Math.max(1, Math.round(delta * .25));
  if (value >= 75) return Math.max(1, Math.round(delta * .5));
  return delta;
}

export function newGame(name: string, origin: OriginKey, lang: Lang): GameState {
  if (!campaign.scenes.length) throw new Error("campaign_not_loaded");
  const selected = origins.find((item) => item.id === origin) ?? origins[2];
  return {
    schemaVersion: 6, name: name.trim() || (lang === "ru" ? "Игрок" : "Player"), origin, lang,
    day: 1, currentSceneId: campaign.scenes[0].id, completedScenes: [], selectedChoices: [],
    realActions: [], dailyRecords: [], stats: { ...selected.stats }, xp: 0, focus: 3,
    momentum: 0, material: 0, stability: 0, streak: 0, returns: 0, room: 0, skipCount: 0,
    relationships: {}, flags: {}, pending: [], consequenceLog: [], journal: [],
    questJournal: {}, activeQuestIds: [], completedQuestIds: [], eventHistory: [],
    favoriteExercises: [], workoutHistory: [], foodEntries: [], sleepEntries: [],
    finance: { income: 0, essentials: 0, flexible: 0, reserve: 0 },
    cloud: { consented: false, apiUrl: "", revision: 0 }, endingId: null,
    accessibility: { reducedMotion: false, highContrast: false },
    journey: { firstChoiceMade: false, firstRealActionDone: false, firstArcCompleted: false },
    saveMeta: { createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString(), recoveryCount: 0 },
  };
}

export function migrateSave(value: unknown): GameState | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Omit<Partial<GameState>, "schemaVersion"> & { schemaVersion?: number; dailyActions?: string[] };
  if (!Number.isInteger(input.schemaVersion) || (input.schemaVersion ?? 0) > 6) return null;
  if (![3, 4, 5, 6].includes(input.schemaVersion ?? 0) || !input.stats || !input.name || !input.origin) return null;
  const base = newGame(input.name, input.origin, input.lang ?? "ru");
  const legacyDaily = input.schemaVersion === 3
    ? (input.dailyActions ?? []).map((actionId) => ({ actionId, status: "completed" as ActionStatus, day: input.day ?? 1 }))
    : (input.dailyRecords ?? []);
  return {
    ...base,
    ...input,
    schemaVersion: 6,
    dailyRecords: legacyDaily,
    relationships: { ...base.relationships, ...(input.relationships ?? {}) },
    flags: { ...base.flags, ...(input.flags ?? {}) },
    finance: { ...base.finance, ...(input.finance ?? {}) },
    cloud: { ...base.cloud, ...(input.cloud ?? {}), consented: Boolean(input.cloud?.consented) },
    accessibility: { ...base.accessibility, ...(input.accessibility ?? {}) },
    journey: {
      ...base.journey,
      ...(input.journey ?? {}),
      firstChoiceMade: Boolean(input.journey?.firstChoiceMade || (input.selectedChoices?.length ?? 0) > 0),
      firstRealActionDone: Boolean(input.journey?.firstRealActionDone || (input.realActions?.length ?? 0) > 0),
      firstArcCompleted: Boolean(input.journey?.firstArcCompleted),
    },
    saveMeta: {
      ...base.saveMeta,
      ...(input.saveMeta ?? {}),
      recoveryCount: Math.max(0, Number(input.saveMeta?.recoveryCount ?? 0)),
    },
  };
}

export function applyEffects(state: GameState, effects: Effect[]): GameState {
  const next = { ...state, stats: { ...state.stats }, relationships: { ...state.relationships }, flags: { ...state.flags } };
  for (const effect of effects) {
    if ("stat" in effect) next.stats[effect.stat] = clamp(next.stats[effect.stat] + positiveDelta(next.stats[effect.stat], effect.delta));
    if ("resource" in effect) next[effect.resource] = Math.max(0, next[effect.resource] + effect.delta);
    if ("relationship" in effect) next.relationships[effect.relationship] = clamp((next.relationships[effect.relationship] ?? 0) + effect.delta);
    if ("flag" in effect) next.flags[effect.flag] = effect.value;
  }
  if (next.stats.discipline > 78 && next.stats.energy < 30) {
    next.stability = clamp(next.stability - 3);
    next.flags["state.burnout_risk"] = true;
  }
  if (next.stats.connections > 65 && next.skipCount > 0) next.focus = Math.min(6, next.focus + 1);
  return next;
}

function extremeStat(state: GameState, direction: "max" | "min"): StatKey {
  const keys = Object.keys(state.stats) as StatKey[];
  return keys.reduce((best, key) => direction === "max"
    ? (state.stats[key] > state.stats[best] ? key : best)
    : (state.stats[key] < state.stats[best] ? key : best));
}

export function meets(requirements: Requirement[] | undefined, state: GameState): boolean {
  return (requirements ?? []).every((requirement) => {
    if (requirement.type === "origin") return state.origin === requirement.value;
    if (requirement.type === "dominant_stat") return extremeStat(state, "max") === requirement.value;
    if (requirement.type === "weak_stat") return extremeStat(state, "min") === requirement.value;
    if (requirement.type === "skip_count") return state.skipCount >= requirement.min;
    if (requirement.type === "real_action") return state.realActions.includes(requirement.id) === requirement.value;
    if (requirement.type === "flag") return Boolean(state.flags[requirement.id]) === requirement.value;
    const value = requirement.type === "stat"
      ? state.stats[requirement.id]
      : (state.relationships[requirement.id] ?? 0);
    return (requirement.min === undefined || value >= requirement.min) && (requirement.max === undefined || value <= requirement.max);
  });
}

export function sceneText(scene: Scene, state: GameState): Localized {
  const match = [...(scene.variants ?? [])].reverse().find((variant) => meets(variant.requirements, state));
  return match?.text ?? scene.text;
}

export function resolveEnding(state: GameState): Ending {
  const measurable: Record<string, number> = { ...state.stats, momentum: state.momentum, return_count: state.returns };
  const fallback: Ending = {
    id: "ending_pending",
    title: { ru: "Финал загружается", en: "Ending loading" },
    priority: 0,
    requirements: {},
    text: { ru: "Обновите страницу после восстановления контента.", en: "Refresh after content recovery." },
    sequence: [],
  };
  return campaign.ending_rules.find((ending) =>
    Object.entries(ending.requirements).every(([key, minimum]) => (measurable[key] ?? 0) >= minimum)
  ) ?? campaign.ending_rules[campaign.ending_rules.length - 1] ?? fallback;
}

export function exportSave(state: GameState): void {
  const payload = { product: "MARKOVMADE: RECODE", schemaVersion: 6, exportedAt: new Date().toISOString(), state };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(blob);
  anchor.download = `markovmade-recode-${state.name.toLowerCase().replace(/[^a-zа-я0-9]+/gi, "-")}.json`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(anchor.href), 0);
}
