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

  useEffect(() => setProfile(loadUserProfile(localStorage)), []);
  if (!profile) return <main className="setupApp"><p>SETUP / LOADING</p></main>;

  function toggleModule(module: ModuleKey) {
    setProfile({ ...profile, enabledModules: profile.enabledModules.includes(module) ? profile.enabledModules.filter((item) => item !== module) : [...profile.enabledModules, module] });
    setSaved(false);
  }

  function save() {
    persistUserProfile(localStorage, profile);
    setSaved(true);
  }

  return <main className="setupApp">
    <header className="setupTop"><a href={`${BASE_PATH}/command/`}>← COMMAND</a><b>PERSONAL PROTOCOL</b><button onClick={() => setLang(lang === "ru" ? "en" : "ru")}>{lang.toUpperCase()}</button></header>
    <section className="setupHero"><p>GOAL → REALITY → MODULES</p><h1>{lang === "ru" ? "Только данные, которые меняют решение." : "Only data that changes the decision."}</h1><span>{lang === "ru" ? "RECODE использует этот локальный профиль, чтобы не навязывать отключённые модули и подбирать масштаб под фактическое время." : "RECODE uses this local profile to avoid pushing disabled modules and to size actions to the time you actually have."}</span></section>

    <section className="setupGrid">
      <article><small>01 / {lang === "ru" ? "ГЛАВНАЯ ЦЕЛЬ" : "PRIMARY GOAL"}</small><h2>{lang === "ru" ? "Что сейчас важнее всего?" : "What matters most now?"}</h2><div className="setupChoices">{(Object.keys(goalMeta) as GoalKey[]).map((goal) => <button className={profile.primaryGoal === goal ? "active" : ""} key={goal} onClick={() => { setProfile({ ...profile, primaryGoal: goal }); setSaved(false); }}>{goalMeta[goal][lang]}</button>)}</div></article>
      <article><small>02 / {lang === "ru" ? "РЕАЛЬНОЕ ВРЕМЯ" : "REAL TIME"}</small><h2>{lang === "ru" ? "Сколько минут обычно реально есть?" : "How many minutes are realistically available?"}</h2><div className="setupChoices timeChoices">{([5,10,20,30,45,60] as const).map((minutes) => <button className={profile.availableMinutes === minutes ? "active" : ""} key={minutes} onClick={() => { setProfile({ ...profile, availableMinutes: minutes }); setSaved(false); }}>{minutes} MIN</button>)}</div></article>
      <article><small>03 / {lang === "ru" ? "МОДУЛИ" : "MODULES"}</small><h2>{lang === "ru" ? "Что действительно хочешь использовать?" : "What do you actually want to use?"}</h2><div className="setupChoices">{modules.map((module) => <button aria-pressed={profile.enabledModules.includes(module.id)} className={profile.enabledModules.includes(module.id) ? "active" : ""} key={module.id} onClick={() => toggleModule(module.id)}>{module[lang]}</button>)}</div><p className="setupNote">{lang === "ru" ? "Отключённый модуль не должен продолжать появляться как приоритет в Daily Command." : "A disabled module should no longer keep appearing as a Daily Command priority."}</p></article>
    </section>

    <footer className="setupSave"><div><small>LOCAL-ONLY PROFILE</small><p>{lang === "ru" ? "Без аккаунта и без отправки наружу." : "No account and no external upload."}</p></div><button onClick={save}>{saved ? (lang === "ru" ? "Сохранено ✓" : "Saved ✓") : (lang === "ru" ? "Сохранить протокол" : "Save protocol")}</button><a href={`${BASE_PATH}/command/`}>{lang === "ru" ? "Открыть Daily Command" : "Open Daily Command"} →</a></footer>
  </main>;
}
