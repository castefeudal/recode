"use client";

import { useEffect, useState } from "react";
import { goalMeta, type GoalKey, type ModuleKey, type UserProfile } from "../domain/profile";
import { loadUserProfile, persistUserProfile } from "../infrastructure/profile-storage";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const modules: Array<{ id: ModuleKey; ru: string; en: string }> = [
  { id: "training", ru: "Тренировки", en: "Training" },
  { id: "recovery", ru: "Восстановление", en: "Recovery" },
  { id: "nutrition", ru: "Питание", en: "Nutrition" },
  { id: "mind", ru: "Разум", en: "Mind" },
  { id: "focus", ru: "Фокус", en: "Focus" },
];

export default function SetupPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [lang, setLang] = useState<"ru" | "en">("ru");
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) setProfile(loadUserProfile(localStorage));
    });
    return () => { active = false; };
  }, []);

  if (!profile) return <main className="setupApp"><p>SETUP / LOADING</p></main>;

  function toggleModule(module: ModuleKey) {
    setProfile((current) => {
      if (!current) return current;
      const enabled = current.enabledModules.includes(module);
      if (enabled && current.enabledModules.length === 1) {
        setNotice(lang === "ru" ? "Оставь хотя бы один модуль: Daily Command должен иметь разрешённый следующий шаг." : "Keep at least one module enabled so Daily Command always has an allowed next action.");
        return current;
      }
      setSaved(false);
      setNotice("");
      return { ...current, enabledModules: enabled ? current.enabledModules.filter((item) => item !== module) : [...current.enabledModules, module] };
    });
  }

  function save() {
    if (!profile) return;
    persistUserProfile(localStorage, profile);
    setSaved(true);
    setNotice(lang === "ru" ? "Протокол сохранён локально." : "Protocol saved locally.");
  }

  return <main className="setupApp">
    <header className="setupTop"><a href={`${BASE_PATH}/command/`}>← COMMAND</a><b>PERSONAL PROTOCOL</b><button onClick={() => setLang(lang === "ru" ? "en" : "ru")}>{lang.toUpperCase()}</button></header>
    <section className="setupHero"><p>GOAL → REALITY → MODULES</p><h1>{lang === "ru" ? "Только данные, которые меняют решение." : "Only data that changes the decision."}</h1><span>{lang === "ru" ? "RECODE использует этот локальный профиль, чтобы не навязывать отключённые модули и подбирать масштаб под фактическое время." : "RECODE uses this local profile to avoid pushing disabled modules and to size actions to the time you actually have."}</span></section>

    <section className="setupGrid">
      <article><small>01 / {lang === "ru" ? "ГЛАВНАЯ ЦЕЛЬ" : "PRIMARY GOAL"}</small><h2>{lang === "ru" ? "Что сейчас важнее всего?" : "What matters most now?"}</h2><div className="setupChoices">{(Object.keys(goalMeta) as GoalKey[]).map((goal) => <button className={profile.primaryGoal === goal ? "active" : ""} key={goal} onClick={() => { setProfile((current) => current ? { ...current, primaryGoal: goal } : current); setSaved(false); setNotice(""); }}>{goalMeta[goal][lang]}</button>)}</div></article>
      <article><small>02 / {lang === "ru" ? "РЕАЛЬНОЕ ВРЕМЯ" : "REAL TIME"}</small><h2>{lang === "ru" ? "Сколько минут обычно реально есть?" : "How many minutes are realistically available?"}</h2><div className="setupChoices timeChoices">{([5,10,20,30,45,60] as const).map((minutes) => <button className={profile.availableMinutes === minutes ? "active" : ""} key={minutes} onClick={() => { setProfile((current) => current ? { ...current, availableMinutes: minutes } : current); setSaved(false); setNotice(""); }}>{minutes} MIN</button>)}</div></article>
      <article><small>03 / {lang === "ru" ? "МОДУЛИ" : "MODULES"}</small><h2>{lang === "ru" ? "Что действительно хочешь использовать?" : "What do you actually want to use?"}</h2><div className="setupChoices">{modules.map((module) => <button aria-pressed={profile.enabledModules.includes(module.id)} className={profile.enabledModules.includes(module.id) ? "active" : ""} key={module.id} onClick={() => toggleModule(module.id)}>{module[lang]}</button>)}</div><p className="setupNote">{lang === "ru" ? "Отключённый модуль не появляется как приоритет. Минимум один модуль должен оставаться активным." : "Disabled modules do not appear as priorities. At least one module must remain active."}</p></article>
    </section>

    <footer className="setupSave"><div><small>LOCAL-ONLY PROFILE</small><p>{lang === "ru" ? "Без аккаунта и без отправки наружу." : "No account and no external upload."}</p></div><button onClick={save}>{saved ? (lang === "ru" ? "Сохранено ✓" : "Saved ✓") : (lang === "ru" ? "Сохранить протокол" : "Save protocol")}</button><a href={`${BASE_PATH}/command/`}>{lang === "ru" ? "Открыть Daily Command" : "Open Daily Command"} →</a></footer>
    {notice && <div className="setupStatus" role="status" aria-live="polite">{notice}</div>}
  </main>;
}
