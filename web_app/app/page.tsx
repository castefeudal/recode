"use client";
/* eslint-disable @next/next/no-img-element -- deployment serves optimized local assets without a server image optimizer. */

import { useEffect, useMemo, useRef, useState } from "react";
import { CloudPanel } from "./components/CloudPanel";
import { Icon, type IconName } from "./design-system/Icon";
import { DialogFrame } from "./design-system/components";
import { clearStoredSaves, loadStoredSave, persistStoredSave } from "./infrastructure/save-storage";
import {
  ActionStatus, Choice, GameState, Lang, OriginKey, Screen, StatKey, applyEffects,
  campaign, chapterById, choiceById, clamp, dailyActions, delayedById, exportSave,
  loadCampaign, meets, migrateSave, newGame, origins, resolveEnding, sceneById, sceneText, statMeta,
} from "./game";


const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const publicUrl = (path: string) => `${BASE_PATH}${path}`;

type Mode = "landing" | "onboarding" | "game";
type Theme = "dark" | "light";
type Localized = { ru: string; en: string };
type Quest = { id: string; type: string; domain: string; title: Localized; description: Localized; duration_minutes: number; reward: { xp: number; momentum: number; material: number }; effects: Array<{ stat: StatKey; delta: number }> };
type EventCard = { id: string; category: string; title: Localized; text: Localized; prerequisites: Array<{ stat: StatKey; min: number }>; decisions: Array<{ id: string; text: Localized; immediate_effects: Array<{ stat: StatKey; delta: number }> }> };
type Exercise = { id: string; name: Localized; body_part: string; equipment: string; target_muscle: string; secondary_muscles: string[]; instructions: { ru: string[]; en: string[] }; safety: { pain_response: Localized } };
type Character = { id: string; name: Localized; role: Localized; biography: Localized; motivation: Localized; fear: Localized; external_goal: Localized; voice: Localized };

const nav: Array<{ id: Screen; ru: string; en: string; code: string; icon: IconName }> = [
  { id: "today", ru: "Сегодня", en: "Today", code: "01", icon: "today" },
  { id: "story", ru: "История", en: "Story", code: "02", icon: "story" },
  { id: "quests", ru: "Квесты", en: "Quests", code: "03", icon: "quests" },
  { id: "body", ru: "Тело", en: "Body", code: "04", icon: "body" },
  { id: "nutrition", ru: "Питание", en: "Nutrition", code: "05", icon: "nutrition" },
  { id: "recovery", ru: "Сон", en: "Recovery", code: "06", icon: "recovery" },
  { id: "mind", ru: "Разум", en: "Mind", code: "07", icon: "mind" },
  { id: "relations", ru: "Связи", en: "Relations", code: "08", icon: "relations" },
  { id: "work", ru: "Работа", en: "Work", code: "09", icon: "work" },
  { id: "city", ru: "Meridian", en: "Meridian", code: "10", icon: "city" },
  { id: "profile", ru: "Профиль", en: "Profile", code: "11", icon: "profile" },
];
const mobilePrimaryIds: Screen[] = ["today", "story", "quests", "body", "profile"];
const mobileMoreIds: Screen[] = ["nutrition", "recovery", "mind", "relations", "work", "city"];
const originArtPosition: Record<OriginKey, string> = {
  lost: "0% 0%",
  burnout: "100% 0%",
  potential: "0% 100%",
  return: "100% 100%",
};
const actionStatus: Record<ActionStatus, Localized> = {
  completed: { ru: "Выполнить", en: "Complete" },
  reduced: { ru: "Уменьшить", en: "Reduce" },
  deferred: { ru: "Перенести", en: "Defer" },
  replaced: { ru: "Заменить", en: "Replace" },
  skipped: { ru: "Честно пропустить", en: "Skip honestly" },
};
const authorship = "Original concept, system and authorship: Павел Марков / Pavel Markov / MARKOVMADE";
function t(value: Localized, lang: Lang) { return value[lang]; }

export default function Home() {
  const [mode, setMode] = useState<Mode>("landing");
  const [step, setStep] = useState(0);
  const [origin, setOrigin] = useState<OriginKey>("potential");
  const [name, setName] = useState("");
  const [lang, setLang] = useState<Lang>("ru");
  const [screen, setScreen] = useState<Screen>("today");
  const [state, setState] = useState<GameState | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState("");
  const [reduced, setReduced] = useState(false);
  const [recoveryNotice, setRecoveryNotice] = useState("");
  const [campaignReady, setCampaignReady] = useState(false);
  const [campaignError, setCampaignError] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [online, setOnline] = useState(true);
  const [updateReady, setUpdateReady] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    loadCampaign().then(() => setCampaignReady(true)).catch(() => setCampaignError(true));
    const timer = window.setTimeout(() => {
      const loaded = loadStoredSave(localStorage);
      if (loaded.state) {
        if (loaded.recovered) {
          loaded.state.saveMeta.recoveryCount += 1;
          setRecoveryNotice(loaded.state.lang === "ru" ? "Сохранение безопасно восстановлено и обновлено до схемы v6." : "Save safely recovered and upgraded to schema v6.");
        }
        setState(loaded.state);
        setLang(loaded.state.lang);
      }
      setReduced(localStorage.getItem("recode-reduced-motion") === "true" || window.matchMedia("(prefers-reduced-motion: reduce)").matches);
      const storedTheme = localStorage.getItem("recode-theme");
      setTheme(storedTheme === "light" || storedTheme === "dark" ? storedTheme : (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"));
      setOnline(navigator.onLine);
      setHydrated(true);
      navigator.serviceWorker?.register(publicUrl("/sw.js"), { scope: `${BASE_PATH || ""}/` }).then((registration) => {
        if (registration.waiting) setUpdateReady(true);
        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          worker?.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) setUpdateReady(true);
          });
        });
      }).catch(() => undefined);
    }, 0);
    const markOnline = () => setOnline(true);
    const markOffline = () => setOnline(false);
    window.addEventListener("online", markOnline);
    window.addEventListener("offline", markOffline);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("online", markOnline);
      window.removeEventListener("offline", markOffline);
    };
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.documentElement.style.setProperty("--today-art", `url("${publicUrl("/art/key/today-before-dawn-v7.webp")}")`);
    document.documentElement.style.setProperty("--city-art", `url("${publicUrl("/art/locations/recode-meridian-city-v10.webp")}")`);
  }, [lang, theme]);
  useEffect(() => {
    if (!hydrated || !state) return;
    try {
      persistStoredSave(localStorage, state, lang);
    } catch {
      queueMicrotask(() => setStorageError(lang === "ru"
        ? "Не удалось записать сохранение. Экспортируйте его в Профиле и освободите место браузера."
        : "The save could not be written. Export it from Profile and free browser storage."));
    }
  }, [state, lang, hydrated]);
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(""), 4200);
    return () => window.clearTimeout(id);
  }, [toast]);

  function launch() {
    if (!campaignReady) return;
    setState(newGame(name, origin, lang)); setMode("game"); setScreen("today");
  }
  function resume() {
    if (!campaignReady) return;
    if (state) { setMode("game"); setScreen("today"); }
    else { setMode("onboarding"); setStep(0); }
  }
  function changeLanguage() {
    const next = lang === "ru" ? "en" : "ru";
    setLang(next); setState((previous) => previous ? { ...previous, lang: next } : previous);
  }
  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("recode-theme", next);
  }
  function toggleMotion() {
    const next = !reduced; setReduced(next); localStorage.setItem("recode-reduced-motion", String(next));
  }
  function activateUpdate() {
    navigator.serviceWorker?.getRegistration().then((registration) => {
      registration?.waiting?.postMessage({ type: "RECODE_ACTIVATE_UPDATE" });
      navigator.serviceWorker?.addEventListener("controllerchange", () => window.location.reload(), { once: true });
    });
  }
  function choose(choice: Choice) {
    if (!state || !state.currentSceneId) return;
    if (!meets(choice.requirements, state)) {
      setToast(lang === "ru" ? "Эта реплика закрыта состоянием отношений." : "This line is locked by the relationship state."); return;
    }
    if (state.focus < choice.cost.amount) {
      setToast(lang === "ru" ? "Не хватает фокуса. Уменьши действие или начни новый день." : "Not enough focus. Reduce an action or begin a new day."); return;
    }
    let next = applyEffects(state, choice.immediate_effects);
    const completedCount = next.completedScenes.length + 1;
    const pending = [...next.pending];
    if (choice.delayed_consequence_id) {
      const delayed = delayedById[choice.delayed_consequence_id];
      pending.push({ id: delayed.id, dueAt: completedCount + delayed.trigger.after_scenes });
    }
    const due = pending.filter((item) => item.dueAt <= completedCount);
    let log = [...next.consequenceLog];
    for (const item of due) {
      const consequence = delayedById[item.id];
      next = applyEffects(next, consequence.effects);
      log = [t(consequence.text, lang), ...log].slice(0, 40);
    }
    if (choice.route_effect) {
      log = [
        lang === "ru" ? `Открыт маршрут ${choice.route_effect.open.split(".").at(-1)}; две альтернативы закрыты.` : `Route ${choice.route_effect.open.split(".").at(-1)} opened; two alternatives closed.`,
        ...log,
      ];
    }
    next = {
      ...next, currentSceneId: choice.next_scene_id,
      completedScenes: [...next.completedScenes, state.currentSceneId],
      selectedChoices: [...next.selectedChoices, choice.id],
      pending: pending.filter((item) => item.dueAt > completedCount),
      consequenceLog: log, stability: clamp(next.stability + 2),
      material: next.material + 1, momentum: next.momentum + (completedCount % 3 === 0 ? 1 : 0),
      journey: {
        ...next.journey,
        firstChoiceMade: true,
        firstArcCompleted: next.journey.firstRealActionDone || next.realActions.length > 0,
      },
    };
    if (!choice.next_scene_id) { const ending = resolveEnding(next); next.endingId = ending.id; }
    setState(next);
    setToast(due.length ? t(delayedById[due[0].id].text, lang) : t(choice.telegraph, lang));
  }
  function recordDaily(actionId: string, status: ActionStatus) {
    if (!state || state.dailyRecords.some((item) => item.day === state.day && item.actionId === actionId)) return;
    const action = dailyActions.find((item) => item.id === actionId);
    if (!action) return;
    const factor = status === "completed" ? 1 : status === "reduced" || status === "replaced" ? .65 : 0;
    const didAct = factor > 0;
    setState({
      ...state,
      dailyRecords: [...state.dailyRecords, { actionId, status, day: state.day }],
      xp: state.xp + Math.round(action.xp * factor), material: state.material + (didAct ? 1 : 0),
      focus: Math.min(6, state.focus + (didAct ? 1 : 0)),
      stability: clamp(state.stability + (didAct ? 4 : status === "skipped" ? 0 : 1)),
      streak: didAct ? state.streak + 1 : state.streak,
      skipCount: state.skipCount + (status === "skipped" ? 1 : 0),
      returns: state.returns + (status === "completed" && state.skipCount > 0 ? 1 : 0),
      stats: { ...state.stats, [action.stat]: clamp(state.stats[action.stat] + (didAct ? 2 : 0)) },
      journey: {
        ...state.journey,
        firstRealActionDone: didAct || state.journey.firstRealActionDone,
        firstArcCompleted: state.journey.firstChoiceMade && (didAct || state.journey.firstRealActionDone),
      },
    });
    setToast(status === "skipped"
      ? (lang === "ru" ? "Пропуск записан без штрафа. Следующая сцена может это запомнить." : "Skip recorded without punishment. A later scene may remember it.")
      : (lang === "ru" ? "Действие записано. Масштаб не важнее честности." : "Action recorded. Scale is not more important than honesty."));
  }
  function completeRealAction(sceneId: string) {
    if (!state || state.realActions.includes(sceneId)) return;
    setState({
      ...state,
      realActions: [...state.realActions, sceneId],
      xp: state.xp + 20,
      focus: Math.min(6, state.focus + 1),
      stability: clamp(state.stability + 4),
      journey: {
        ...state.journey,
        firstRealActionDone: true,
        firstArcCompleted: state.journey.firstChoiceMade,
      },
    });
    setToast(lang === "ru" ? "Реальное действие изменит доступный вариант следующей сцены." : "The real action will alter a later scene variant.");
  }
  function nextDay() {
    if (!state) return;
    const today = state.dailyRecords.filter((item) => item.day === state.day);
    const acted = today.some((item) => ["completed", "reduced", "replaced"].includes(item.status));
    setState({ ...state, day: state.day + 1, focus: Math.min(6, state.focus + 2), streak: acted ? state.streak : Math.max(0, state.streak - 1) });
    setToast(lang === "ru" ? "Новый день. Серия не обнулена: система считает возвращение." : "New day. The streak is not destroyed: returning counts.");
  }
  function reset() {
    clearStoredSaves(localStorage);
    setState(null); setMode("onboarding"); setStep(0);
  }

  if (mode === "onboarding") return <Onboarding theme={theme} toggleTheme={toggleTheme} step={step} setStep={setStep} origin={origin} setOrigin={setOrigin} name={name} setName={setName} lang={lang} changeLanguage={changeLanguage} launch={launch} back={() => setMode("landing")} ready={campaignReady} consentAccepted={consentAccepted} setConsentAccepted={setConsentAccepted} />;
  if (mode === "game" && state) return <GameShell theme={theme} toggleTheme={toggleTheme} state={state} setState={setState as React.Dispatch<React.SetStateAction<GameState>>} lang={lang} changeLanguage={changeLanguage} screen={screen} setScreen={setScreen} choose={choose} recordDaily={recordDaily} completeRealAction={completeRealAction} nextDay={nextDay} reset={reset} toast={toast} reduced={reduced} toggleMotion={toggleMotion} recoveryNotice={recoveryNotice} storageError={storageError} online={online} updateReady={updateReady} activateUpdate={activateUpdate} />;
  return <Landing theme={theme} toggleTheme={toggleTheme} lang={lang} changeLanguage={changeLanguage} hasSave={Boolean(state)} resume={resume} ready={campaignReady} error={campaignError} online={online} updateReady={updateReady} activateUpdate={activateUpdate} />;
}

function Landing({ theme, toggleTheme, lang, changeLanguage, hasSave, resume, ready, error, online, updateReady, activateUpdate }: { theme: Theme; toggleTheme: () => void; lang: Lang; changeLanguage: () => void; hasSave: boolean; resume: () => void; ready: boolean; error: boolean; online: boolean; updateReady: boolean; activateUpdate: () => void }) {
  const proof = campaign.design_contract;
  return <main className={`landing theme-${theme}`} id="top">
    <a className="skipLink" href="#main-content">{lang === "ru" ? "К основному содержанию" : "Skip to main content"}</a>
    <header className="landingNav"><a className="brand" href="#top"><span>MARKOVMADE</span><b>RECODE</b></a><nav aria-label={lang === "ru" ? "Разделы презентации" : "Presentation sections"}><a href="#premise">{lang === "ru" ? "Формула" : "Formula"}</a><a href="#proof">{lang === "ru" ? "Система" : "System"}</a><a href="#season">{lang === "ru" ? "Сезон" : "Season"}</a></nav><div className="landingTools"><button className="themeButton" onClick={toggleTheme} aria-label={theme === "dark" ? (lang === "ru" ? "Включить светлую тему" : "Use light theme") : (lang === "ru" ? "Включить тёмную тему" : "Use dark theme")}><Icon name={theme === "dark" ? "sun" : "moon"} size={17} /></button><button className="textButton" onClick={changeLanguage}>{lang.toUpperCase()} / {lang === "ru" ? "EN" : "RU"}</button><button className="solidButton" disabled={!ready} onClick={resume}>{ready ? (hasSave ? (lang === "ru" ? "Продолжить" : "Continue") : (lang === "ru" ? "Начать" : "Begin")) : (lang === "ru" ? "Загрузка…" : "Loading…")}</button></div></header>
    {updateReady && <aside className="updateBanner" role="status"><span>{lang === "ru" ? "Новая версия RECODE готова без потери прогресса." : "A new RECODE version is ready without losing progress."}</span><button onClick={activateUpdate}>{lang === "ru" ? "Обновить" : "Update"}</button></aside>}
    <section className="hero" id="main-content" tabIndex={-1}>
      <picture className="heroMedia">
        <source media="(max-width: 760px)" type="image/avif" srcSet={publicUrl("/art/key/hero-mobile-v6.avif")} />
        <source media="(max-width: 760px)" type="image/webp" srcSet={publicUrl("/art/key/hero-mobile-v6.webp")} />
        <source type="image/webp" srcSet={publicUrl("/art/key/recode-hero-v10.webp")} />
        <source type="image/avif" srcSet={publicUrl("/art/key/hero-desktop-v6.avif")} />
        <source type="image/webp" srcSet={publicUrl("/art/key/hero-desktop-v6.webp")} />
        <img className="heroImage" src={publicUrl("/art/key/recode-hero-v10.webp")} alt={lang === "ru" ? "Человек перед ночным Meridian: момент выбора под дождём" : "A person facing Meridian at night: a moment of choice in the rain"} fetchPriority="high" />
      </picture>
      <div className="heroVeil" />
      <div className="heroContent">
        <p className="eyebrow">LIFE RPG · SEASON 01 / POINT A</p>
        <span className="heroPromise">{lang === "ru" ? "НЕ ТРЕКЕР · МИР ПОМНИТ ДЕЙСТВИЕ" : "NOT A TRACKER · THE WORLD REMEMBERS ACTION"}</span>
        <h1>{lang === "ru" ? <>ПЕРЕПИШИ<br /><em>РЕШЕНИЯ.</em></> : <>RECODE<br /><em>YOUR CHOICES.</em></>}</h1>
        <p className="heroLead">{lang === "ru" ? "Сюжет даёт взрослый выбор. Реальное действие меняет героя, отношения, районы Meridian и финальную последовательность." : "The story gives you an adult choice. A real action changes the character, relationships, Meridian and the ending sequence."}</p>
        <ProductProof lang={lang} />
        <div className="heroActions"><button className="goldButton" disabled={!ready} onClick={resume}>{ready ? (hasSave ? (lang === "ru" ? "Вернуться в Meridian" : "Return to Meridian") : (lang === "ru" ? "Начать протокол" : "Begin protocol")) : (lang === "ru" ? "Загрузка сезона…" : "Loading season…")}<span>↗</span></button><span className={`connectionBadge ${online ? "" : "offline"}`}>{online ? (lang === "ru" ? "СЕТЬ · ДОСТУПНА" : "ONLINE · READY") : (lang === "ru" ? "OFFLINE · СОХРАНЕНИЕ ЛОКАЛЬНО" : "OFFLINE · LOCAL SAVE")}</span></div>
        <small>{authorship}</small>
      </div>
      <div className="heroData"><span><small>CAMPAIGN</small>14 CHAPTERS</span><span><small>BRANCHES</small>{String(proof.critical_branch_nodes)}</span><span><small>VARIANTS</small>{String(proof.conditional_scene_variants)}</span><span><small>MODE</small>OFFLINE-FIRST</span></div>
    </section>
    <section className="premise" id="premise"><div className="sectionIndex">01</div><div className="sectionCopy"><p className="eyebrow">SITUATION → CHOICE → ACTION → CONSEQUENCE → RETURN</p><h2>{lang === "ru" ? "Игра не награждает идеальность. Она запоминает возвращение." : "The game does not reward perfection. It remembers returning."}</h2><p>{lang === "ru" ? "Сон может стоить статуса, граница — близости, а амбиция — восстановления. Пропуск не стирает прогресс, но меняет контекст следующих сцен." : "Sleep may cost status, a boundary may cost closeness, and ambition may cost recovery. A skip does not erase progress, but changes later scenes."}</p></div><div className="formula">{[["01","SITUATION",lang === "ru" ? "Конкретный конфликт" : "Concrete conflict"],["02","CHOICE",lang === "ru" ? "Необратимая цена" : "Irreversible cost"],["03","ACTION","3–10 MIN"],["04","TRACE",lang === "ru" ? "Мир отвечает" : "The world responds"],["05","RETURN",lang === "ru" ? "Возврат — навык" : "Return is a skill"]].map(([n,h,p]) => <article key={n}><span>{n}</span><h3>{h}</h3><p>{p}</p></article>)}</div></section>
    <section className="systemsShowcase" id="proof"><div><p className="eyebrow">02 / VERIFIED CONTENT CONTRACT</p><h2>{lang === "ru" ? "Не витрина. Полный локальный продукт." : "Not a showcase. A complete local product."}</h2></div><div className="systemCards">{[
      ["30", lang === "ru" ? "Критических ветвлений" : "Critical branches"],
      ["89", lang === "ru" ? "Условных вариантов" : "Conditional variants"],
      ["275", lang === "ru" ? "Квестов в runtime" : "Runtime quests"],
      ["160", lang === "ru" ? "Контекстных событий" : "Context events"],
      ["1 324", lang === "ru" ? "Упражнения" : "Exercises"],
      ["8 × 4", lang === "ru" ? "Финальных актов" : "Ending acts"],
    ].map(([count,label],index) => <article key={label}><small>0{index + 1}</small><h3>{count}</h3><p>{label}</p></article>)}</div></section>
    <section className="cast"><div className="castVisual"><picture><source type="image/avif" srcSet={publicUrl("/art/key/cast-v6.avif")} /><source type="image/webp" srcSet={publicUrl("/art/key/cast-v6.webp")} /><img src={publicUrl("/art/key/cast-v6.png")} loading="lazy" alt={lang === "ru" ? "Персонажи Meridian в момент напряжённого решения" : "Meridian characters in a tense moment of decision"} /></picture></div><div className="castText"><p className="eyebrow">03 / RELATIONSHIPS REMEMBER</p><h2>{lang === "ru" ? "Они не выдают задания. Они меняют мнение." : "They do not dispense tasks. They change their minds."}</h2><p>{lang === "ru" ? "Доверие открывает реплики, напряжение закрывает удобные пути, а персонажи приходят к финалу со своим решением." : "Trust opens dialogue, tension closes convenient routes, and each character reaches the ending with a decision of their own."}</p><div className="nameGrid">{["MIRA","PAVEL","ALINA","LEON","MAX","EVA","VERA","NIKITA"].map((item,index) => <span key={item}>0{index + 1} / {item}</span>)}</div></div></section>
    <section className="season" id="season"><header><p className="eyebrow">04 / SEASON 01 · POINT A</p><h2>{lang === "ru" ? "Идеально пройти нельзя." : "A perfect run is impossible."}</h2><p>{lang === "ru" ? "140 сцен, 420 решений, 70 возвращающихся последствий, обязательный динамический срыв и восемь четырёхактных финалов." : "140 scenes, 420 decisions, 70 returning consequences, a mandatory dynamic setback, and eight four-act endings."}</p></header><div className="chapterList">{campaign.chapters.map((chapter) => <article key={chapter.id}><span>{String(chapter.order).padStart(2,"0")}</span><div><h3>{t(chapter.title,lang)}</h3><p>{t(chapter.dramatic_question,lang)}</p></div><small>10 SCENES</small></article>)}</div></section>
    <section className="finalCall"><p className="eyebrow">MARKOVMADE: RECODE / LIFE RPG</p><h2>{lang === "ru" ? <>Не обещай новую жизнь.<br /><em>Сделай точное действие.</em></> : <>Do not promise a new life.<br /><em>Take one precise action.</em></>}</h2>{error && <p role="alert">{lang === "ru" ? "Не удалось загрузить сезон. Обновите страницу." : "The season could not load. Refresh the page."}</p>}<button className="goldButton" disabled={!ready} onClick={resume}>{ready ? (lang === "ru" ? "Войти в Meridian" : "Enter Meridian") : (lang === "ru" ? "Загрузка сезона…" : "Loading season…")}<span>→</span></button></section>
    <footer className="siteFooter"><div className="brand"><span>MARKOVMADE</span><b>RECODE</b></div><p>{authorship}</p><small>© 2026 MARKOVMADE · Privacy-first · No pay-to-win · Not medical care</small></footer>
  </main>;
}

function ProductProof({ lang }: { lang: Lang }) {
  const [selected, setSelected] = useState(0);
  const paths = [
    {
      choice: { ru: "Сделать десять точных минут", en: "Do ten precise minutes" },
      action: { ru: "ДЕЙСТВИЕ · 10 МИН", en: "ACTION · 10 MIN" },
      consequence: { ru: "Mira замечает: ты не обещал максимум — ты вернулся.", en: "Mira notices: you did not promise a maximum—you returned." },
      signal: "+4 STABILITY · ROUTE: RETURN",
    },
    {
      choice: { ru: "Уменьшить задачу, не отменяя", en: "Reduce the task without cancelling" },
      action: { ru: "ДЕЙСТВИЕ · 3 МИН", en: "ACTION · 3 MIN" },
      consequence: { ru: "Meridian открывает восстановительный маршрут вместо штрафа.", en: "Meridian opens a recovery route instead of a penalty." },
      signal: "+2 BALANCE · RECOVERY OPEN",
    },
    {
      choice: { ru: "Честно пропустить сегодня", en: "Skip honestly today" },
      action: { ru: "ДЕЙСТВИЕ · 0 МИН", en: "ACTION · 0 MIN" },
      consequence: { ru: "Прогресс не исчезает. Следующая сцена меняет контекст.", en: "Progress remains. The next scene changes its context." },
      signal: "NO PENALTY · CONTEXT REMEMBERED",
    },
  ];
  const current = paths[selected];
  return <section className="productProof" aria-label={lang === "ru" ? "Интерактивный пример игрового цикла" : "Interactive core-loop example"}>
    <header><small>LIVE CORE LOOP</small><span>CHOICE → ACTION → WORLD</span></header>
    <div className="proofChoices">{paths.map((path, index) => <button key={path.signal} className={selected === index ? "selected" : ""} aria-pressed={selected === index} onClick={() => setSelected(index)}><i>0{index + 1}</i>{t(path.choice, lang)}</button>)}</div>
    <div className="proofResult" aria-live="polite"><span>{t(current.action, lang)}</span><p>{t(current.consequence, lang)}</p><b>{current.signal}</b></div>
  </section>;
}

function Onboarding({ theme, toggleTheme, step, setStep, origin, setOrigin, name, setName, lang, changeLanguage, launch, back, ready, consentAccepted, setConsentAccepted }: { theme: Theme; toggleTheme: () => void; step: number; setStep: (value: number) => void; origin: OriginKey; setOrigin: (value: OriginKey) => void; name: string; setName: (value: string) => void; lang: Lang; changeLanguage: () => void; launch: () => void; back: () => void; ready: boolean; consentAccepted: boolean; setConsentAccepted: (value: boolean) => void }) {
  const selected = origins.find((item) => item.id === origin) ?? origins[2];
  return <main className={`onboarding theme-${theme}`}><a className="skipLink" href="#onboard-content">{lang === "ru" ? "К шагу протокола" : "Skip to protocol step"}</a><header><button className="textButton" onClick={step ? () => setStep(step - 1) : back}>← {lang === "ru" ? "Назад" : "Back"}</button><div className="progress" role="progressbar" aria-label={lang === "ru" ? "Прогресс знакомства" : "Onboarding progress"} aria-valuemin={1} aria-valuemax={3} aria-valuenow={step + 1}><i style={{ width: `${(step + 1) * 33.33}%` }} /></div><div className="onboardTools"><button className="themeButton" onClick={toggleTheme} aria-label={theme === "dark" ? "Light theme" : "Dark theme"}><Icon name={theme === "dark" ? "sun" : "moon"} size={16} /></button><button className="textButton" onClick={changeLanguage}>{lang.toUpperCase()} / {lang === "ru" ? "EN" : "RU"}</button></div></header>
    {step === 0 && <section className="onboardStage" id="onboard-content" tabIndex={-1}><div><p className="eyebrow">PROTOCOL 00 / CONSENT</p><h1>{lang === "ru" ? "Это Life RPG. Не медицинская услуга." : "This is a Life RPG. Not a medical service."}</h1><p>{lang === "ru" ? "Сезон работает локально без аккаунта. Дневник не отправляется наружу. Cloud, health и analytics требуют отдельного согласия." : "The season works locally without an account. Journal entries stay on device. Cloud, health and analytics require separate consent."}</p><div className="consentGrid"><span>✓ OFFLINE-FIRST</span><span>✓ LOCAL JOURNAL</span><span>✓ SAFE RETURN</span><span>✓ EXPORT / DELETE</span></div><label className="consentCheck"><input type="checkbox" checked={consentAccepted} onChange={(event) => setConsentAccepted(event.target.checked)} /><span>{lang === "ru" ? "Я понимаю локальное хранение, право на экспорт/удаление и то, что продукт не заменяет врача." : "I understand local storage, export/delete rights, and that this product does not replace medical care."}</span></label><button className="goldButton" disabled={!consentAccepted} onClick={() => setStep(1)}>{lang === "ru" ? "Продолжить осознанно" : "Continue with consent"}<span>→</span></button></div></section>}
    {step === 1 && <section className="originStage"><div className="originIntro"><p className="eyebrow">PROTOCOL 01 / POINT A</p><h1>{lang === "ru" ? "Выбери честное начало." : "Choose an honest beginning."}</h1><p>{lang === "ru" ? "Это не диагноз и не вечный класс: выбор меняет стартовые показатели, первые сцены и реакции Meridian." : "This is not a diagnosis or a permanent class: the choice changes starting stats, early scenes and Meridian reactions."}</p></div><div className="originGrid">{origins.map((item) => <button key={item.id} style={{ backgroundImage: `linear-gradient(180deg, rgba(5,8,10,.08), rgba(5,8,10,.94) 72%), url("${publicUrl("/art/key/recode-origins-v10.webp")}")`, backgroundSize: "200% 200%", backgroundPosition: originArtPosition[item.id] }} className={origin === item.id ? "selected" : ""} onClick={() => setOrigin(item.id)}><span>{item.number}</span><small>{t(item.subtitle,lang)}</small><h2>{t(item.title,lang)}</h2><p>{t(item.description,lang)}</p><strong>{t(item.tension,lang)}</strong><i>{origin === item.id ? "SELECTED" : "SELECT"}</i></button>)}</div><button className="goldButton nextOrigin" onClick={() => setStep(2)}>{lang === "ru" ? "Зафиксировать точку А" : "Lock Point A"}<span>→</span></button></section>}
    {step === 2 && <section className="identityStage"><div><p className="eyebrow">PROTOCOL 02 / IDENTITY</p><h1>{lang === "ru" ? "Как к тебе обращаться в Meridian?" : "How should Meridian address you?"}</h1><input autoFocus value={name} onChange={(event) => setName(event.target.value.slice(0,32))} placeholder={lang === "ru" ? "Имя или позывной" : "Name or callsign"} /><article><small>{t(selected.title,lang).toUpperCase()}</small><p>{t(selected.tension,lang)}</p></article><button className="goldButton" disabled={!ready} onClick={launch}>{ready ? (lang === "ru" ? "Войти в Meridian" : "Enter Meridian") : (lang === "ru" ? "Сезон загружается…" : "Season loading…")}<span>↗</span></button><small>{lang === "ru" ? "Прогресс сохраняется локально и атомарно." : "Progress is saved locally and atomically."}</small></div></section>}
  </main>;
}

function GameShell({ theme, toggleTheme, state, setState, lang, changeLanguage, screen, setScreen, choose, recordDaily, completeRealAction, nextDay, reset, toast, reduced, toggleMotion, recoveryNotice, storageError, online, updateReady, activateUpdate }: { theme: Theme; toggleTheme: () => void; state: GameState; setState: React.Dispatch<React.SetStateAction<GameState>>; lang: Lang; changeLanguage: () => void; screen: Screen; setScreen: (value: Screen) => void; choose: (choice: Choice) => void; recordDaily: (id: string, status: ActionStatus) => void; completeRealAction: (id: string) => void; nextDay: () => void; reset: () => void; toast: string; reduced: boolean; toggleMotion: () => void; recoveryNotice: string; storageError: string; online: boolean; updateReady: boolean; activateUpdate: () => void }) {
  const level = Math.floor(state.xp / 180) + 1;
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const screenMeta = (id: Screen) => nav.find((item) => item.id === id)!;
  const openScreen = (next: Screen) => { setScreen(next); setMobileMoreOpen(false); };
  return <main className={`game theme-${theme} screen-${screen} ${reduced ? "reduceMotion" : ""} ${state.accessibility.highContrast ? "highContrast" : ""}`}><a className="skipLink" href="#game-content">{lang === "ru" ? "К содержанию экрана" : "Skip to screen content"}</a><aside className="rail" aria-label={lang === "ru" ? "Главная навигация" : "Primary navigation"}><button className="railBrand" aria-label={lang === "ru" ? "Сегодня" : "Today"} onClick={() => setScreen("today")}><span>MM</span><b>R</b></button><nav>{nav.map((item) => <button title={item[lang]} aria-label={item[lang]} aria-current={screen === item.id ? "page" : undefined} className={screen === item.id ? "active" : ""} onClick={() => setScreen(item.id)} key={item.id}><Icon name={item.icon} size={18} /><span className="navCode">{item.code}</span><small>{item[lang]}</small></button>)}</nav><button className="avatar" aria-label={lang === "ru" ? `Профиль ${state.name}, уровень ${level}` : `${state.name} profile, level ${level}`} onClick={() => setScreen("profile")}>{state.name.slice(0,1).toUpperCase()}<i>{level}</i></button></aside><section className="gameFrame"><header className="gameTop"><div><span className="mark">MARKOVMADE</span><b>RECODE</b><span className="activeScreenLabel">{nav.find((item) => item.id === screen)?.[lang]}</span><small>SEASON 01 · DAY {String(state.day).padStart(2,"0")}</small></div><div className="resourceBar" aria-label={lang === "ru" ? "Ресурсы" : "Resources"}><span><small>XP</small>{state.xp}</span><span><small>FOCUS</small>{state.focus}</span><span><small>MAT</small>{state.material}</span><span><small>STABILITY</small>{state.stability}%</span></div><div><span className={`networkDot ${online ? "" : "offline"}`} title={online ? "online" : "offline"} aria-label={online ? "online" : "offline"} /><button className="topButton themeToggleGame" onClick={toggleTheme} aria-label={theme === "dark" ? (lang === "ru" ? "Светлая тема" : "Light theme") : (lang === "ru" ? "Тёмная тема" : "Dark theme")}><Icon name={theme === "dark" ? "sun" : "moon"} size={16} /></button><button className="topButton" onClick={changeLanguage}>{lang.toUpperCase()}</button><button className="topButton motionButton" onClick={toggleMotion}><Icon name="motion" size={15} /> {reduced ? "OFF" : "ON"}</button><button className="topButton contrastButton" aria-pressed={state.accessibility.highContrast} onClick={() => setState((previous) => ({ ...previous, accessibility: { ...previous.accessibility, highContrast: !previous.accessibility.highContrast } }))}><Icon name="contrast" size={15} /> {state.accessibility.highContrast ? "HIGH" : "STD"}</button></div></header>{updateReady && <aside className="updateBanner inGame" role="status"><span>{lang === "ru" ? "Обновление готово. Прогресс сохранён." : "Update ready. Progress is preserved."}</span><button onClick={activateUpdate}>{lang === "ru" ? "Обновить" : "Update"}</button></aside>}<div className="gamePage" id="game-content" tabIndex={-1}>
    {screen === "today" && <Today state={state} setState={setState} lang={lang} setScreen={setScreen} recordDaily={recordDaily} nextDay={nextDay} />}
    {screen === "story" && <Story state={state} lang={lang} choose={choose} completeRealAction={completeRealAction} />}
    {screen === "quests" && <Quests state={state} setState={setState} lang={lang} />}
    {screen === "body" && <Body state={state} setState={setState} lang={lang} />}
    {screen === "nutrition" && <Nutrition state={state} setState={setState} lang={lang} />}
    {screen === "recovery" && <Recovery state={state} setState={setState} lang={lang} />}
    {screen === "mind" && <Mind state={state} setState={setState} lang={lang} />}
    {screen === "relations" && <Relations state={state} lang={lang} />}
    {screen === "work" && <WorkMoney state={state} setState={setState} lang={lang} />}
    {screen === "city" && <City state={state} setState={setState} lang={lang} />}
    {screen === "profile" && <Profile state={state} setState={setState} lang={lang} reset={reset} recoveryNotice={recoveryNotice} />}
  </div></section><nav className="mobilePrimaryNav" aria-label={lang === "ru" ? "Основные разделы" : "Primary destinations"}>{mobilePrimaryIds.map((id) => { const item = screenMeta(id); return <button key={id} className={screen === id ? "active" : ""} aria-current={screen === id ? "page" : undefined} onClick={() => openScreen(id)}><Icon name={item.icon} size={18} /><small>{item[lang]}</small></button>; })}<button className={mobileMoreOpen ? "active" : ""} aria-expanded={mobileMoreOpen} aria-controls="mobile-more-menu" onClick={() => setMobileMoreOpen((open) => !open)}><Icon name={mobileMoreOpen ? "close" : "menu"} size={18} /><small>{lang === "ru" ? "Ещё" : "More"}</small></button></nav>{mobileMoreOpen && <div className="mobileMoreMenu" id="mobile-more-menu" role="dialog" aria-label={lang === "ru" ? "Остальные разделы" : "More destinations"}>{mobileMoreIds.map((id) => { const item = screenMeta(id); return <button key={id} className={screen === id ? "active" : ""} onClick={() => openScreen(id)}><Icon name={item.icon} size={18} /><span>{item[lang]}</span><b>→</b></button>; })}</div>}<div className="liveRegion" role="status" aria-live="polite" aria-atomic="true">{storageError || toast}</div>{storageError && <div className="toast errorToast" aria-hidden="true">{storageError}</div>}{toast && !storageError && <div className="toast" aria-hidden="true">{toast}</div>}</main>;
}

function Today({ state, setState, lang, setScreen, recordDaily, nextDay }: { state: GameState; setState: React.Dispatch<React.SetStateAction<GameState>>; lang: Lang; setScreen: (value: Screen) => void; recordDaily: (id: string, status: ActionStatus) => void; nextDay: () => void }) {
  const [events, setEvents] = useState<EventCard[]>([]);
  useEffect(() => { fetch(publicUrl("/content/events.json?v=7.0.0")).then((r) => r.json()).then(setEvents).catch(() => setEvents([])); }, []);
  const scene = state.currentSceneId ? sceneById[state.currentSceneId] : null;
  const chapter = scene ? chapterById[scene.chapter_id] : null;
  const today = state.dailyRecords.filter((item) => item.day === state.day);
  const event = events.filter((item) => item.prerequisites.every((requirement) => state.stats[requirement.stat] >= requirement.min))[state.day % Math.max(1, events.length)];
  function resolveEvent(decision: EventCard["decisions"][number]) {
    if (!event || state.eventHistory.includes(event.id)) return;
    setState((previous) => ({ ...applyEffects(previous, decision.immediate_effects), eventHistory: [...previous.eventHistory, event.id], xp: previous.xp + 8 }));
  }
  return <section className="module today"><PageTitle kicker={`DAY ${String(state.day).padStart(2,"0")} · ${today.length}/6 CHECK-INS`} title={lang === "ru" ? `${state.name}, сегодня нужен не максимум.` : `${state.name}, today does not require your maximum.`} text={lang === "ru" ? "Утро → сюжет → обязательство → действие → событие → рефлексия → сон." : "Morning → story → commitment → action → event → reflection → sleep."} /><div className="todayHero"><div className="todayHeroCopy"><small>{lang === "ru" ? "СЮЖЕТНЫЙ УЗЕЛ" : "STORY NODE"}</small><h2>{chapter ? t(chapter.title,lang) : t(resolveEnding(state).title,lang)}</h2><p>{scene ? t(scene.title,lang) : t(resolveEnding(state).text,lang)}</p><div className="worldTrace"><span><small>{lang === "ru" ? "ТЕКУЩИЙ СЛЕД" : "CURRENT TRACE"}</small><b>{state.journey.firstArcCompleted ? (lang === "ru" ? "МИР ОТВЕТИЛ" : "WORLD RESPONDED") : (lang === "ru" ? "РЕШЕНИЕ ОЖИДАЕТСЯ" : "CHOICE PENDING")}</b></span><span><small>{lang === "ru" ? "ВОЗВРАТЫ" : "RETURNS"}</small><b>{String(state.returns).padStart(2,"0")}</b></span></div><button className="goldButton" onClick={() => setScreen("story")}>{scene ? (lang === "ru" ? "Продолжить историю" : "Continue story") : (lang === "ru" ? "Увидеть финал" : "See ending")}<span>→</span></button></div><div className="orbit"><b>{state.stability}</b><span>STABILITY</span><i style={{ "--progress": `${state.stability * 3.6}deg` } as React.CSSProperties} /></div></div>
    <div className={`trajectoryStrip ${state.journey.firstArcCompleted ? "complete" : ""}`} aria-label={lang === "ru" ? "Первая игровая арка" : "First game arc"}>
      <span className={state.journey.firstChoiceMade ? "done" : ""}><small>01 / CHOICE</small><b>{state.journey.firstChoiceMade ? (lang === "ru" ? "Решение принято" : "Choice made") : (lang === "ru" ? "Продолжи историю" : "Continue the story")}</b></span>
      <i>→</i>
      <span className={state.journey.firstRealActionDone ? "done" : ""}><small>02 / ACTION</small><b>{state.journey.firstRealActionDone ? (lang === "ru" ? "Действие записано" : "Action recorded") : (lang === "ru" ? "Выбери честный масштаб" : "Choose an honest scale")}</b></span>
      <i>→</i>
      <span className={state.journey.firstArcCompleted ? "done" : ""}><small>03 / WORLD</small><b>{state.journey.firstArcCompleted ? (lang === "ru" ? "Meridian изменил траекторию" : "Meridian changed the route") : (lang === "ru" ? "Мир ждёт след" : "The world awaits a trace")}</b></span>
    </div>
    <div className="dailyHead"><div><p className="eyebrow">{lang === "ru" ? "РЕАЛЬНЫЕ ДЕЙСТВИЯ" : "REAL ACTIONS"}</p><h2>{lang === "ru" ? "Полный спектр честных исходов." : "A full range of honest outcomes."}</h2></div><button className="outlineButton" onClick={nextDay}>{lang === "ru" ? "Вечерняя рефлексия" : "Evening reflection"} →</button></div><div className="dailyGrid">{dailyActions.map((action) => { const record = today.find((item) => item.actionId === action.id); return <article className={record ? "done" : ""} key={action.id}><header><small>{statMeta[action.stat].code}</small><span>{action.minutes} MIN</span></header><h3>{t(action.title,lang)}</h3><p>{t(action.text,lang)}</p>{record ? <footer><span>{t(actionStatus[record.status],lang)}</span><b>✓</b></footer> : <div className="actionMenu">{(Object.keys(actionStatus) as ActionStatus[]).map((status) => <button key={status} onClick={() => recordDaily(action.id,status)}>{t(actionStatus[status],lang)}</button>)}</div>}</article>; })}</div>
    {event && <article className="contextEvent"><small>{lang === "ru" ? "КОНТЕКСТНОЕ СОБЫТИЕ" : "CONTEXT EVENT"} · {event.category}</small><h2>{t(event.title,lang)}</h2><p>{t(event.text,lang)}</p><div>{event.decisions.map((decision) => <button disabled={state.eventHistory.includes(event.id)} key={decision.id} onClick={() => resolveEvent(decision)}>{t(decision.text,lang)}</button>)}</div></article>}
  </section>;
}

function Story({ state, lang, choose, completeRealAction }: { state: GameState; lang: Lang; choose: (choice: Choice) => void; completeRealAction: (id: string) => void }) {
  if (!state.currentSceneId) {
    const ending = campaign.ending_rules.find((item) => item.id === state.endingId) ?? resolveEnding(state);
    return <section className="module ending"><p className="eyebrow">SEASON 01 / ENDING {String(ending.priority).padStart(2,"0")}</p><h1>{t(ending.title,lang)}</h1><p>{t(ending.text,lang)}</p><div className="endingSequence">{ending.sequence.map((phase,index) => <article key={phase.phase}><small>ACT 0{index + 1}</small><h2>{t(phase.title,lang)}</h2><p>{t(phase.text,lang)}</p></article>)}</div><div className="endingStats">{(Object.keys(state.stats) as StatKey[]).map((key) => <span key={key}><small>{statMeta[key][lang]}</small><b>{state.stats[key]}</b></span>)}</div><small>{authorship}</small></section>;
  }
  const scene = sceneById[state.currentSceneId];
  const chapter = chapterById[scene.chapter_id];
  const progress = state.completedScenes.length / campaign.scenes.length * 100;
  return <section className="module story"><header className="storyHeader"><div><p className="eyebrow">CHAPTER {String(chapter.order).padStart(2,"0")} · SCENE {String(scene.order).padStart(2,"0")}/10 {scene.branch_node ? "· BRANCH" : ""}</p><h1>{t(chapter.title,lang)}</h1></div><div><span>{state.completedScenes.length + 1} / {campaign.scenes.length}</span><div><i style={{ width: `${progress}%` }} /></div></div></header><div className="storyStage"><aside><img className="storyBackdrop" src={publicUrl("/art/key/story-meridian-archive-v7.webp")} alt="" aria-hidden="true" /><div className="storyIdentity"><small>{t(scene.location,lang)}</small><h2>{t(scene.speaker,lang)}</h2><p>{t(chapter.dramatic_question,lang)}</p><div className="chapterRail">{campaign.chapters.map((item) => <i key={item.id} className={item.order < chapter.order ? "past" : item.id === chapter.id ? "current" : ""} />)}</div></div></aside><article><div className="sceneMeta"><span>{scene.branch_node ? (lang === "ru" ? "ТОЧКА ВЕТВЛЕНИЯ" : "BRANCH POINT") : (lang === "ru" ? "СЦЕНА ПОСЛЕДСТВИЯ" : "CONSEQUENCE SCENE")}</span><b>{String(scene.order).padStart(2,"0")}</b></div><p className="sceneTitle">{t(scene.title,lang)}</p><blockquote>{t(sceneText(scene,state),lang)}</blockquote><p className="dialogueLine">{t(scene.dialogue,lang)}</p>{scene.real_action && <div className="realAction"><div><small>{lang === "ru" ? "РЕАЛЬНОЕ ДЕЙСТВИЕ" : "REAL ACTION"} · {scene.real_action.minutes} MIN</small><p>{t(scene.real_action.prompt,lang)}</p></div><button disabled={state.realActions.includes(scene.id)} onClick={() => completeRealAction(scene.id)}>{state.realActions.includes(scene.id) ? "✓" : lang === "ru" ? "Я сделал" : "Done"}</button></div>}<div className="choices">{scene.choices.map((id,index) => { const choice = choiceById[id]; const available = meets(choice.requirements,state); const locked = state.focus < choice.cost.amount || !available; return <button disabled={locked} onClick={() => choose(choice)} key={id}><span>0{index + 1}</span><div><b>{t(choice.text,lang)}</b><small>{available ? t(choice.telegraph,lang) : (lang === "ru" ? "Нужно больше доверия" : "More trust required")}{choice.cost.amount ? ` · −${choice.cost.amount} FOCUS` : ""}{choice.route_effect ? (lang === "ru" ? " · ЗАКРОЕТ 2 МАРШРУТА" : " · CLOSES 2 ROUTES") : ""}</small></div><i>→</i></button>; })}</div></article></div>{state.consequenceLog.length > 0 && <div className="consequence"><small>{lang === "ru" ? "ЖУРНАЛ ПОСЛЕДСТВИЙ" : "CONSEQUENCE JOURNAL"}</small>{state.consequenceLog.slice(0,3).map((item,index) => <p key={`${item}-${index}`}>{item}</p>)}</div>}</section>;
}

function Quests({ state, setState, lang }: { state: GameState; setState: React.Dispatch<React.SetStateAction<GameState>>; lang: Lang }) {
  const [quests, setQuests] = useState<Quest[]>([]), [query, setQuery] = useState(""), [type, setType] = useState("all");
  useEffect(() => { fetch(publicUrl("/content/quests.json?v=7.0.0")).then((r) => r.json()).then(setQuests).catch(() => setQuests([])); }, []);
  const filtered = useMemo(() => quests.filter((quest) => (type === "all" || quest.type === type) && `${t(quest.title,lang)} ${t(quest.description,lang)} ${quest.domain}`.toLowerCase().includes(query.toLowerCase())).slice(0,60), [quests,query,type,lang]);
  function record(quest: Quest, status: ActionStatus) {
    if (state.questJournal[quest.id]) return;
    const factor = status === "completed" ? 1 : status === "reduced" || status === "replaced" ? .6 : 0;
    let next = applyEffects(state, factor ? quest.effects : []);
    next = { ...next, questJournal: { ...next.questJournal, [quest.id]: status }, completedQuestIds: factor ? [...next.completedQuestIds,quest.id] : next.completedQuestIds, xp: next.xp + Math.round(quest.reward.xp * factor), material: next.material + (factor ? quest.reward.material : 0), momentum: next.momentum + (factor ? quest.reward.momentum : 0), skipCount: next.skipCount + (status === "skipped" ? 1 : 0) };
    setState(next);
  }
  return <section className="module"><PageTitle kicker="QUEST ENGINE / 275 CONNECTED RECORDS" title={lang === "ru" ? "Квест — договор с контекстом." : "A quest is a contract with context."} text={lang === "ru" ? "Eligibility, тип, домен, ручная проверка, уменьшение, замена и честный пропуск работают прямо в runtime." : "Eligibility, type, domain, manual verification, reduction, replacement and honest skipping all work in runtime."} /><div className="filterRow"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={lang === "ru" ? "Поиск по 275 квестам…" : "Search all 275 quests…"} /><select value={type} onChange={(e) => setType(e.target.value)}><option value="all">ALL TYPES</option>{["daily","weekly","story","recovery","social","psychology","workout","audio"].map((item) => <option key={item}>{item}</option>)}</select><span>{filtered.length} / {quests.length || 275}</span></div><div className="questList">{filtered.map((quest) => <article key={quest.id}><header><small>{quest.type} · {quest.domain}</small><span>{quest.duration_minutes} MIN</span></header><h3>{t(quest.title,lang)}</h3><p>{t(quest.description,lang)}</p>{state.questJournal[quest.id] ? <b>✓ {t(actionStatus[state.questJournal[quest.id]],lang)}</b> : <div className="actionMenu">{(["completed","reduced","deferred","replaced","skipped"] as ActionStatus[]).map((status) => <button key={status} onClick={() => record(quest,status)}>{t(actionStatus[status],lang)}</button>)}</div>}</article>)}</div></section>;
}

function Body({ state, setState, lang }: { state: GameState; setState: React.Dispatch<React.SetStateAction<GameState>>; lang: Lang }) {
  const [all, setAll] = useState<Exercise[]>([]), [query, setQuery] = useState(""), [part, setPart] = useState("all"), [equipment, setEquipment] = useState("all"), [selected, setSelected] = useState<Exercise | null>(null);
  useEffect(() => { fetch(publicUrl("/content/exercises.json?v=7.0.0")).then((r) => r.json()).then((data) => setAll(data.exercises)).catch(() => setAll([])); }, []);
  const parts = useMemo(() => [...new Set(all.map((item) => item.body_part))].sort(), [all]);
  const equipmentList = useMemo(() => [...new Set(all.map((item) => item.equipment))].sort(), [all]);
  const filtered = useMemo(() => all.filter((item) => (part === "all" || item.body_part === part) && (equipment === "all" || item.equipment === equipment) && `${item.name.ru} ${item.name.en} ${item.target_muscle} ${item.secondary_muscles.join(" ")}`.toLowerCase().includes(query.toLowerCase())).slice(0,80), [all,query,part,equipment]);
  function toggleFavourite(id: string) { setState((previous) => ({ ...previous, favoriteExercises: previous.favoriteExercises.includes(id) ? previous.favoriteExercises.filter((item) => item !== id) : [...previous.favoriteExercises,id] })); }
  function addWorkout(item: Exercise) { setState((previous) => ({ ...previous, workoutHistory: [`D${previous.day} · ${item.id} · 3×8 · RPE 7 · RIR 3 · 90s`, ...previous.workoutHistory].slice(0,50), xp: previous.xp + 6, stats: { ...previous.stats, body: clamp(previous.stats.body + 1) } })); }
  return <section className="module"><PageTitle kicker="BODY / 1 324 EXERCISES · FULL RUNTIME" title={lang === "ru" ? "Техника раньше интенсивности." : "Technique before intensity."} text={lang === "ru" ? "Поиск, мышцы, оборудование, избранное, история, техника и безопасная замена загружаются отдельным content chunk." : "Search, muscles, equipment, favourites, history, technique and safe replacement load as a separate content chunk."} /><div className="filterRow"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={lang === "ru" ? "Название или мышца…" : "Name or muscle…"} /><select value={part} onChange={(e) => setPart(e.target.value)}><option value="all">ALL BODY PARTS</option>{parts.map((item) => <option key={item}>{item}</option>)}</select><select value={equipment} onChange={(e) => setEquipment(e.target.value)}><option value="all">ALL EQUIPMENT</option>{equipmentList.map((item) => <option key={item}>{item}</option>)}</select><span>{filtered.length} / {all.length || 1324}</span></div><div className="exerciseList">{filtered.map((item) => <article key={item.id}><div><small>{item.body_part} · {item.target_muscle}</small><h3><button className="linkButton" onClick={() => setSelected(item)}>{t(item.name,lang)}</button></h3></div><span>{item.equipment}</span><b>{state.favoriteExercises.includes(item.id) ? "★" : "☆"}</b><button onClick={() => toggleFavourite(item.id)} aria-label="Favourite">♡</button><button onClick={() => addWorkout(item)}>＋</button></article>)}</div>{selected && <div className="detailPanel"><button className="close" onClick={() => setSelected(null)}>×</button><small>{selected.id} · {selected.body_part} · {selected.equipment}</small><h2>{t(selected.name,lang)}</h2><ol>{selected.instructions[lang].map((line) => <li key={line}>{line}</li>)}</ol><div className="programPrescription"><span>SETS <b>3</b></span><span>REPS <b>8</b></span><span>RPE <b>7</b></span><span>RIR <b>3</b></span><span>REST <b>90s</b></span></div><p className="safety">{t(selected.safety.pain_response,lang)}</p></div>}<p className="safety">{lang === "ru" ? "Игра не диагностирует травмы. Острая или нарастающая боль требует остановки; медицинские решения не принимает AI-наставник." : "The game does not diagnose injuries. Sharp or increasing pain requires stopping; the AI mentor does not make medical decisions."}</p></section>;
}

function Nutrition({ state, setState, lang }: { state: GameState; setState: React.Dispatch<React.SetStateAction<GameState>>; lang: Lang }) {
  const [weight,setWeight] = useState(80), [height,setHeight] = useState(180), [age,setAge] = useState(29), [activity,setActivity] = useState(1.55), [sex,setSex] = useState<"m"|"f">("m"), [meal,setMeal] = useState(""), [hunger,setHunger] = useState(5), [energy,setEnergy] = useState(5);
  const bmr = Math.round(10 * weight + 6.25 * height - 5 * age + (sex === "m" ? 5 : -161)), tdee = Math.round(bmr * activity);
  const calculatorFields: Array<[string, number, React.Dispatch<React.SetStateAction<number>>]> = [["AGE",age,setAge],["HEIGHT CM",height,setHeight],["WEIGHT KG",weight,setWeight]];
  function addMeal() { if (!meal.trim()) return; setState((previous) => ({ ...previous, foodEntries: [{ id: crypto.randomUUID(), meal: meal.trim(), hunger, energy, day: previous.day }, ...previous.foodEntries].slice(0,60), stats: { ...previous.stats, balance: clamp(previous.stats.balance + 1) } })); setMeal(""); }
  return <section className="module"><PageTitle kicker="NUTRITION / LOCAL-ONLY LOG" title={lang === "ru" ? "Оценка, не назначение." : "An estimate, not a prescription."} text={lang === "ru" ? "Mifflin–St Jeor, диапазон TDEE, нейтральный журнал еды и обратная связь голода/энергии. Никаких наказаний голоданием." : "Mifflin–St Jeor, a TDEE range, neutral food log and hunger/energy feedback. No compensatory restriction."} /><div className="nutritionGrid"><div className="calculator">{calculatorFields.map(([label,value,setter]) => <label key={label}>{label}<input type="number" value={value} onChange={(e) => setter(+e.target.value)} /></label>)}<label>SEX<select value={sex} onChange={(e) => setSex(e.target.value as "m"|"f")}><option value="m">M</option><option value="f">F</option></select></label><label className="wide">ACTIVITY<select value={activity} onChange={(e) => setActivity(+e.target.value)}>{[1.2,1.375,1.55,1.725].map((value) => <option key={value}>{value}</option>)}</select></label></div><aside><small>ESTIMATED MAINTENANCE</small><strong>{tdee.toLocaleString()} <em>KCAL</em></strong><span>{lang === "ru" ? "Наблюдаемый диапазон" : "Observation range"}<b>{Math.round(tdee*.94)}–{Math.round(tdee*1.06)}</b></span><span>{lang === "ru" ? "Проверка тренда" : "Trend review"}<b>14 DAYS</b></span><span>{lang === "ru" ? "Вода" : "Water"}<b>MANUAL</b></span></aside></div><div className="logPanel"><h2>{lang === "ru" ? "Нейтральный food log" : "Neutral food log"}</h2><input value={meal} onChange={(e) => setMeal(e.target.value)} placeholder={lang === "ru" ? "Что было в приёме пищи?" : "What was in the meal?"} /><label>HUNGER {hunger}/10<input type="range" min="0" max="10" value={hunger} onChange={(e) => setHunger(+e.target.value)} /></label><label>ENERGY {energy}/10<input type="range" min="0" max="10" value={energy} onChange={(e) => setEnergy(+e.target.value)} /></label><button className="goldButton" onClick={addMeal}>{lang === "ru" ? "Записать локально" : "Record locally"}<span>→</span></button>{state.foodEntries.slice(0,5).map((item) => <p key={item.id}>D{item.day} · {item.meal} · H{item.hunger} / E{item.energy}</p>)}</div></section>;
}

function Recovery({ state, setState, lang }: { state: GameState; setState: React.Dispatch<React.SetStateAction<GameState>>; lang: Lang }) {
  const [bedtime,setBedtime] = useState("23:30"), [wake,setWake] = useState("07:30"), [quality,setQuality] = useState(6);
  const latest = state.sleepEntries[0];
  const readiness = latest ? clamp(latest.quality * 8 + state.stats.energy * .2) : clamp(state.stats.energy);
  const debt = Math.max(0, 70 - readiness);
  function save() { setState((previous) => ({ ...previous, sleepEntries: [{ id: crypto.randomUUID(), bedtime, wake, quality, day: previous.day }, ...previous.sleepEntries].slice(0,30), stats: { ...previous.stats, energy: clamp(previous.stats.energy + (quality >= 6 ? 2 : 0)), balance: clamp(previous.stats.balance + 1) } })); }
  return <section className="module"><PageTitle kicker="RECOVERY / MANUAL · CONSENT-FIRST" title={lang === "ru" ? "Нагрузка начинается с готовности." : "Load begins with readiness."} text={lang === "ru" ? "Ручной ввод работает без health-интеграций. HealthKit/Health Connect остаются отдельным опциональным слоем согласия." : "Manual entry works without health integrations. HealthKit and Health Connect remain a separate optional consent layer."} /><div className="recoveryGrid"><div className="readiness"><small>READINESS</small><b>{readiness}<em>/100</em></b><p>{debt > 25 ? (lang === "ru" ? "Сегодня снизь объём и оставь RPE ≤ 6." : "Reduce volume and keep RPE ≤ 6 today.") : (lang === "ru" ? "Обычная нагрузка допустима при хорошем самочувствии." : "Normal load is reasonable if you feel well.")}</p><span>RECOVERY DEBT <strong>{debt}</strong></span></div><div className="sleepForm"><label>BEDTIME<input type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)} /></label><label>WAKE<input type="time" value={wake} onChange={(e) => setWake(e.target.value)} /></label><label>QUALITY {quality}/10<input type="range" min="0" max="10" value={quality} onChange={(e) => setQuality(+e.target.value)} /></label><button className="goldButton" onClick={save}>{lang === "ru" ? "Завершить вечер" : "Close the evening"}<span>→</span></button></div></div></section>;
}

function Mind({ state, setState, lang }: { state: GameState; setState: React.Dispatch<React.SetStateAction<GameState>>; lang: Lang }) {
  const [stress,setStress] = useState(5), [entry,setEntry] = useState("");
  function save() { if (!entry.trim()) return; setState((previous) => ({ ...previous, journal: [`${stress}/10 — ${entry.trim()}`, ...previous.journal].slice(0,50), xp: previous.xp + 12, stats: { ...previous.stats, mind: clamp(previous.stats.mind + 1) } })); setEntry(""); }
  function exportJournal() { const blob = new Blob([state.journal.join("\n\n")], { type: "text/plain" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "recode-local-journal.txt"; a.click(); }
  return <section className="module"><PageTitle kicker="MIND / REFLECTION · NOT THERAPY" title={lang === "ru" ? "Отделить мысль от действия." : "Separate a thought from an action."} text={lang === "ru" ? "Stress check-in, барьеры, ценности, границы и протокол возвращения. Текст остаётся локальным и не попадает в analytics." : "Stress check-in, barriers, values, boundaries and a return protocol. Text stays local and never enters analytics."} /><div className="mindGrid"><div className="stress"><small>CURRENT TENSION</small><b>{stress}<em>/10</em></b><input aria-label="Stress" type="range" min="0" max="10" value={stress} onChange={(e) => setStress(+e.target.value)} /><p>{stress > 7 ? (lang === "ru" ? "Уменьши сложность. При угрозе себе или другим обратись за экстренной профессиональной помощью." : "Reduce complexity. If you may harm yourself or others, seek immediate professional help.") : (lang === "ru" ? "Назови факт, мысль и одно безопасное действие отдельно." : "Name the fact, the thought and one safe action separately.")}</p></div><div className="journal"><label>{lang === "ru" ? "ФАКТ → МЫСЛЬ → ДЕЙСТВИЕ" : "FACT → THOUGHT → ACTION"}<textarea value={entry} onChange={(e) => setEntry(e.target.value)} /></label><button className="goldButton" onClick={save}>{lang === "ru" ? "Сохранить локально" : "Save locally"}<span>→</span></button><button className="outlineButton" onClick={exportJournal}>{lang === "ru" ? "Экспорт" : "Export"}</button><button className="outlineButton" onClick={() => setState((previous) => ({ ...previous, journal: [] }))}>{lang === "ru" ? "Удалить журнал" : "Delete journal"}</button></div></div><div className="journalLog">{state.journal.slice(0,8).map((item,index) => <p key={`${item}-${index}`}>{item}</p>)}</div></section>;
}

function Relations({ state, lang }: { state: GameState; lang: Lang }) {
  const [characters,setCharacters] = useState<Character[]>([]);
  useEffect(() => { fetch(publicUrl("/content/characters.json?v=7.0.0")).then((r) => r.json()).then(setCharacters).catch(() => setCharacters([])); }, []);
  return <section className="module"><PageTitle kicker="RELATIONSHIPS / MEMORY" title={lang === "ru" ? "Близость не равна удобству." : "Closeness is not convenience."} text={lang === "ru" ? "Доверие, уважение, близость и напряжение меняют доступные реплики и финальные ответы персонажей." : "Trust, respect, closeness and tension change available dialogue and final character responses."} /><div className="characterGrid">{characters.map((character) => { const score = state.relationships[character.id] ?? 0; return <article key={character.id}><img src={publicUrl(`/art/characters/${character.id}.webp`)} alt={`${t(character.name,lang)} · ${t(character.role,lang)}`} loading="lazy" decoding="async" /><div className="characterCopy"><small>{t(character.role,lang)}</small><h2>{t(character.name,lang)}</h2><p>{t(character.biography,lang)}</p><blockquote>{t(character.voice,lang)}</blockquote><div className="axisGrid">{[["TRUST",score],["RESPECT",clamp(score*.9 + 8)],["CLOSENESS",clamp(score*.75)],["TENSION",clamp(28-score*.3)]].map(([label,value]) => <span key={String(label)}><small>{label}</small><i><b style={{ width: `${value}%` }} /></i></span>)}</div><footer><span>{lang === "ru" ? "Цель" : "Goal"}: {t(character.external_goal,lang)}</span><span>{lang === "ru" ? "Страх" : "Fear"}: {t(character.fear,lang)}</span></footer></div></article>; })}</div></section>;
}

function WorkMoney({ state, setState, lang }: { state: GameState; setState: React.Dispatch<React.SetStateAction<GameState>>; lang: Lang }) {
  const finance = state.finance, remainder = finance.income - finance.essentials - finance.flexible;
  function update(key: keyof GameState["finance"], value: number) { setState((previous) => ({ ...previous, finance: { ...previous.finance, [key]: Math.max(0,value) } })); }
  return <section className="module"><PageTitle kicker="WORK / MONEY · SCENARIO, NOT ADVICE" title={lang === "ru" ? "Скорость имеет стоимость." : "Speed has a cost."} text={lang === "ru" ? "Модель перегруза, дедлайнов и финансовой устойчивости — игровой сценарий, не финансовая рекомендация." : "A workload, deadline and resilience model—a game scenario, not financial advice."} /><div className="workGrid"><article><small>CAREER LOAD</small><h2>{state.stats.energy < 35 ? (lang === "ru" ? "Риск перегруза" : "Overload risk") : (lang === "ru" ? "Устойчивый темп" : "Sustainable pace")}</h2><p>{lang === "ru" ? "Выбери одно: ускорить дедлайн ценой энергии или пересогласовать объём ценой статуса." : "Choose one: accelerate the deadline at an energy cost, or renegotiate scope at a status cost."}</p><div className="choicePair"><button onClick={() => setState((previous) => ({ ...previous, xp: previous.xp + 10, stats: { ...previous.stats, energy: clamp(previous.stats.energy - 5), discipline: clamp(previous.stats.discipline + 2) } }))}>{lang === "ru" ? "Ускорить" : "Accelerate"}</button><button onClick={() => setState((previous) => ({ ...previous, stats: { ...previous.stats, balance: clamp(previous.stats.balance + 2), connections: clamp(previous.stats.connections - 1) } }))}>{lang === "ru" ? "Пересогласовать" : "Renegotiate"}</button></div></article><article className="financeCard"><small>FINANCIAL RESILIENCE</small>{([["income",lang === "ru" ? "Доход" : "Income"],["essentials",lang === "ru" ? "Обязательные" : "Essentials"],["flexible",lang === "ru" ? "Гибкие" : "Flexible"],["reserve",lang === "ru" ? "Резерв" : "Reserve"]] as Array<[keyof GameState["finance"],string]>).map(([key,label]) => <label key={key}>{label}<input type="number" value={finance[key]} onChange={(e) => update(key,+e.target.value)} /></label>)}<strong className={remainder < 0 ? "signal" : ""}>{lang === "ru" ? "Остаток сценария" : "Scenario remainder"}: {remainder}</strong></article></div></section>;
}

function City({ state, setState, lang }: { state: GameState; setState: React.Dispatch<React.SetStateAction<GameState>>; lang: Lang }) {
  const [district,setDistrict] = useState("LAB");
  const districts = ["APARTMENT","LAB","NORTH GYM","MOVEMENT CLINIC","SILENCE GARDEN","NIGHT MARKET","ROOFTOP"];
  const cost = 4 + state.room * 2;
  function upgrade() { if (state.material < cost || state.room >= 6) return; setState((previous) => ({ ...previous, material: previous.material-cost, room: previous.room+1, xp: previous.xp+35 })); }
  return <section className="module"><PageTitle kicker="MERIDIAN / FUNCTIONAL MAP" title={lang === "ru" ? "Город меняется вместе с системой." : "The city changes with the system."} text={lang === "ru" ? "Районы открывают разные функции. Квартира отражает реальные действия; улучшения не продаются." : "Districts expose different functions. The apartment reflects real actions; upgrades are never sold."} /><div className="cityMap"><div className="mapCore"><b>MERIDIAN</b><span>{district}</span>{districts.map((item,index) => <button style={{ "--angle": `${index * 51}deg` } as React.CSSProperties} className={district===item ? "active" : ""} key={item} onClick={() => setDistrict(item)}>{String(index+1).padStart(2,"0")}</button>)}</div><aside><small>SELECTED DISTRICT</small><h2>{district}</h2><p>{lang === "ru" ? "Функция района связана с сюжетом, действиями и текущим уровнем пространства." : "The district function is tied to story, actions and the current room level."}</p><span>TRANSFORMATION <b>{Math.round((state.completedScenes.length/140)*100)}%</b></span></aside></div><div className={`room level${state.room}`}><div className="roomWindow"><i /><i /><i /></div><div className="roomBed" /><div className="roomDesk" /><div className="roomPlant" /><span>APARTMENT · LEVEL {state.room}</span></div><div className="upgrade"><div><small>NEXT FUNCTIONAL STAGE</small><h2>{["RESET","LIGHT","RECOVERY","MOVEMENT","LIBRARY","MEMORY","OPEN LAB"][Math.min(state.room,6)]}</h2></div><div><b>{cost} MAT</b><button disabled={state.material<cost || state.room>=6} onClick={upgrade}>{state.room>=6 ? "MAX" : lang === "ru" ? "Улучшить" : "Upgrade"} →</button></div></div></section>;
}

function Profile({ state, setState, lang, reset, recoveryNotice }: { state: GameState; setState: React.Dispatch<React.SetStateAction<GameState>>; lang: Lang; reset: () => void; recoveryNotice: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const origin = origins.find((item) => item.id === state.origin) ?? origins[2];
  async function importFile(file?: File) {
    if (!file) return;
    try { const parsed = JSON.parse(await file.text()); const migrated = migrateSave(parsed.state ?? parsed); if (!migrated) throw new Error("invalid"); setState(migrated); } catch { window.alert(lang === "ru" ? "Файл сохранения повреждён или несовместим." : "The save is corrupted or incompatible."); }
  }
  return <section className="module"><PageTitle kicker={`${t(origin.title,lang).toUpperCase()} · LEVEL ${Math.floor(state.xp/180)+1}`} title={lang === "ru" ? `${state.name}, траектория уже видна.` : `${state.name}, the trajectory is visible.`} text={t(origin.tension,lang)} />{recoveryNotice && <div className="notice">{recoveryNotice}</div>}<div className="profileGrid"><div className="stats">{(Object.keys(state.stats) as StatKey[]).map((key) => <article key={key}><header><span>{statMeta[key].code}</span><b>{statMeta[key][lang]}</b><strong>{state.stats[key]}</strong></header><div><i style={{ width: `${state.stats[key]}%` }} /></div></article>)}</div><aside><small>SEASON</small><span>{lang === "ru" ? "Сцены" : "Scenes"}<b>{state.completedScenes.length} / 140</b></span><span>{lang === "ru" ? "Решения" : "Choices"}<b>{state.selectedChoices.length}</b></span><span>{lang === "ru" ? "Квесты" : "Quests"}<b>{Object.keys(state.questJournal).length} / 275</b></span><span>{lang === "ru" ? "Пропуски / возвраты" : "Skips / returns"}<b>{state.skipCount} / {state.returns}</b></span><button className="outlineButton" onClick={() => exportSave(state)}>{lang === "ru" ? "Экспорт сохранения" : "Export save"}</button><button className="outlineButton" onClick={() => fileRef.current?.click()}>{lang === "ru" ? "Импорт и миграция" : "Import & migrate"}</button><input ref={fileRef} hidden type="file" accept=".json,application/json" onChange={(e) => importFile(e.target.files?.[0])} /></aside></div><div className="privacyGrid"><article><small>LOCAL DATA</small><h3>{lang === "ru" ? "Дневник, питание и сон" : "Journal, food and sleep"}</h3><p>{lang === "ru" ? "Всегда локальны: cloud sync намеренно исключает эти поля из payload." : "Always local: cloud sync deliberately excludes these fields from its payload."}</p></article><article><small>ACCESSIBILITY</small><h3>WCAG 2.2 AA TARGET</h3><p>{lang === "ru" ? "Клавиатура, видимый focus, reduced motion, 44×44 targets и screen-reader landmarks." : "Keyboard, visible focus, reduced motion, 44×44 targets and screen-reader landmarks."}</p></article></div><CloudPanel state={state} setState={setState} lang={lang} /><div className="dangerZone"><p>{lang === "ru" ? "Удаление стирает основную и резервную локальные копии." : "Deletion removes both primary and backup local copies."}</p><button onClick={() => setConfirmingReset(true)}>{lang === "ru" ? "Удалить весь прогресс" : "Delete all progress"}</button></div>{confirmingReset && <DialogFrame title={lang === "ru" ? "Удалить весь прогресс?" : "Delete all progress?"} onClose={() => setConfirmingReset(false)}><div className="dangerDialog"><p>{lang === "ru" ? "Это удалит основное и резервное сохранение на этом устройстве. Экспортируй файл, если хочешь оставить копию." : "This removes the primary and backup save on this device. Export a copy first if you want to keep it."}</p><div><button className="outlineButton" onClick={() => setConfirmingReset(false)}>{lang === "ru" ? "Отмена" : "Cancel"}</button><button className="dangerButton" onClick={reset}>{lang === "ru" ? "Удалить безвозвратно" : "Delete permanently"}</button></div></div></DialogFrame>}</section>;
}

function PageTitle({ kicker, title, text }: { kicker: string; title: string; text: string }) { return <header className="pageTitle"><p className="eyebrow">{kicker}</p><h1>{title}</h1><p>{text}</p></header>; }
