"use client";

import { useEffect, useMemo, useState } from "react";
import { assessRecovery, sleepDurationMinutes, upsertSleepEntry } from "../domain/recovery";
import type { GameState, Lang } from "../game";
import { clamp } from "../game";
import { loadStoredSaveReady, persistStoredSave } from "../infrastructure/save-storage";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function durationLabel(minutes: number | null, lang: Lang): string {
  if (minutes === null) return "—";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return lang === "ru" ? `${hours} ч ${rest} мин` : `${hours}h ${rest}m`;
}

export default function RecoveryPage() {
  const [state, setState] = useState<GameState | null>(null);
  const [lang, setLang] = useState<Lang>("ru");
  const [bedtime, setBedtime] = useState("23:30");
  const [wake, setWake] = useState("07:30");
  const [quality, setQuality] = useState(6);
  const [subjectiveEnergy, setSubjectiveEnergy] = useState(6);
  const [message, setMessage] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    loadStoredSaveReady(localStorage).then((loaded) => {
      if (!active) return;
      if (loaded.state) {
        setState(loaded.state);
        setLang(loaded.state.lang);
        setSubjectiveEnergy(Math.max(1, Math.min(10, Math.round(loaded.state.stats.energy / 10))));
        const latest = loaded.state.sleepEntries[0];
        if (latest) {
          setBedtime(latest.bedtime);
          setWake(latest.wake);
          setQuality(latest.quality);
        }
      }
      setHydrated(true);
    }).catch(() => {
      if (active) setHydrated(true);
    });
    return () => { active = false; };
  }, []);

  const assessment = useMemo(() => state ? assessRecovery(state, lang) : null, [state, lang]);
  const previewDuration = sleepDurationMinutes(bedtime, wake);

  function saveSleep() {
    if (!state || previewDuration === null) {
      setMessage(lang === "ru" ? "Проверь время сна и подъёма." : "Check bedtime and wake time.");
      return;
    }
    const existing = state.sleepEntries.find((entry) => entry.day === state.day);
    const entry = {
      id: existing?.id ?? crypto.randomUUID(),
      bedtime,
      wake,
      quality: Math.max(1, Math.min(10, Math.round(quality))),
      day: state.day,
    };
    const energy = clamp(Math.round(subjectiveEnergy) * 10);
    const next: GameState = {
      ...state,
      sleepEntries: upsertSleepEntry(state.sleepEntries, entry),
      stats: { ...state.stats, energy },
      flags: {
        ...state.flags,
        "recovery.logged": true,
        "recovery.low": entry.quality <= 4 || previewDuration < 6 * 60 || subjectiveEnergy <= 3,
      },
      consequenceLog: [
        lang === "ru"
          ? `Восстановление записано: ${durationLabel(previewDuration, lang)}, сон ${entry.quality}/10, энергия ${subjectiveEnergy}/10. Daily Protocol пересчитан.`
          : `Recovery logged: ${durationLabel(previewDuration, lang)}, sleep ${entry.quality}/10, energy ${subjectiveEnergy}/10. Daily Protocol recalculated.`,
        ...state.consequenceLog,
      ].slice(0, 40),
    };
    persistStoredSave(localStorage, next, lang);
    setState(next);
    setMessage(existing
      ? (lang === "ru" ? "Запись этого дня обновлена без дублирования истории." : "Today's entry was updated without duplicating history.")
      : (lang === "ru" ? "Записано. Daily Command теперь учитывает эту ночь." : "Saved. Daily Command now uses this night."));
  }

  if (!hydrated) return <main className="recoveryApp recoveryEmpty"><p>RECOVERY / LOADING STATE</p></main>;

  if (!state || !assessment) {
    return <main className="recoveryApp recoveryEmpty"><a href={`${BASE_PATH}/`}>← RECODE</a><section><p>RECOVERY / LOCAL DATA</p><h1>NO ACTIVE SAVE</h1><p>Start RECODE first so recovery can adapt the same local game state.</p></section></main>;
  }

  const bandLabel = assessment.band === "below" ? (lang === "ru" ? "НИЖЕ БАЗОВОГО" : "BELOW BASELINE")
    : assessment.band === "strong" ? (lang === "ru" ? "СИЛЬНОЕ" : "STRONG")
    : assessment.band === "normal" ? (lang === "ru" ? "ОБЫЧНОЕ" : "NORMAL")
    : (lang === "ru" ? "МАЛО ДАННЫХ" : "INSUFFICIENT DATA");

  return <main className="recoveryApp">
    <header className="recoveryTop"><a href={`${BASE_PATH}/command/`}>← COMMAND</a><b>RECOVERY</b><button onClick={() => setLang(lang === "ru" ? "en" : "ru")}>{lang.toUpperCase()}</button></header>

    <section className="recoveryHero">
      <p>OBSERVE → EXPLAIN → ADAPT</p>
      <h1>{lang === "ru" ? "Не балл. Контекст нагрузки." : "Not a score. Load context."}</h1>
      <span>{lang === "ru" ? "RECODE не диагностирует восстановление. Он показывает доступные сигналы и уменьшает сложность, когда данные указывают на слабую ночь." : "RECODE does not diagnose recovery. It shows available signals and reduces difficulty when the data points to a weak night."}</span>
    </section>

    <section className="recoveryGridPremium">
      <article className={`recoveryAssessment band-${assessment.band}`}>
        <small>RECOVERY</small>
        <h2>{bandLabel}</h2>
        <div className="recoveryNumbers"><span><small>{lang === "ru" ? "СОН" : "SLEEP"}</small><b>{durationLabel(assessment.sleepMinutes, lang)}</b></span><span><small>{lang === "ru" ? "КАЧЕСТВО" : "QUALITY"}</small><b>{assessment.quality ?? "—"}{assessment.quality !== null ? "/10" : ""}</b></span><span><small>{lang === "ru" ? "ЭНЕРГИЯ" : "ENERGY"}</small><b>{assessment.energy}/100</b></span></div>
        <div className="recoveryFactors"><small>{lang === "ru" ? "ЧТО ПОВЛИЯЛО" : "WHAT AFFECTED IT"}</small>{assessment.factors.map((factor) => <p key={factor}>— {factor}</p>)}</div>
        <aside><small>{lang === "ru" ? "ЧТО ИЗМЕНИТЬ СЕГОДНЯ" : "WHAT TO CHANGE TODAY"}</small><p>{assessment.adjustment}</p></aside>
      </article>

      <article className="sleepCapture">
        <small>{lang === "ru" ? "ЗАПИСАТЬ НОЧЬ" : "LOG THE NIGHT"}</small>
        <h2>{durationLabel(previewDuration, lang)}</h2>
        <div className="sleepTimes"><label>{lang === "ru" ? "ЛЁГ" : "BEDTIME"}<input type="time" value={bedtime} onChange={(event) => setBedtime(event.target.value)} /></label><label>{lang === "ru" ? "ВСТАЛ" : "WAKE"}<input type="time" value={wake} onChange={(event) => setWake(event.target.value)} /></label></div>
        <label className="qualityField"><span>{lang === "ru" ? "СУБЪЕКТИВНОЕ КАЧЕСТВО СНА" : "SUBJECTIVE SLEEP QUALITY"}<b>{quality}/10</b></span><input type="range" min="1" max="10" value={quality} onChange={(event) => setQuality(Number(event.target.value))} /></label>
        <label className="qualityField"><span>{lang === "ru" ? "ЭНЕРГИЯ СЕЙЧАС" : "ENERGY RIGHT NOW"}<b>{subjectiveEnergy}/10</b></span><input type="range" min="1" max="10" value={subjectiveEnergy} onChange={(event) => setSubjectiveEnergy(Number(event.target.value))} /></label>
        <button className="recoveryPrimary" onClick={saveSleep}>{lang === "ru" ? "Сохранить и адаптировать" : "Save and adapt"}</button>
        <p className="recoveryPrivacy">{lang === "ru" ? "Хранится локально. Сон и энергия — субъективные записи, а не медицинские измерения." : "Stored locally. Sleep and energy are subjective records, not medical measurements."}</p>
      </article>
    </section>

    <section className="recoveryLink"><div><small>DAILY COMMAND</small><h2>{lang === "ru" ? "Новая запись сразу меняет следующий протокол." : "A new entry immediately changes the next protocol."}</h2></div><a href={`${BASE_PATH}/command/`}>{lang === "ru" ? "Посмотреть адаптацию" : "See adaptation"} →</a></section>
    {message && <div className="recoveryToast" role="status" aria-live="polite">{message}</div>}
  </main>;
}
