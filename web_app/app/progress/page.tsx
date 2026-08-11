"use client";

import { useEffect, useMemo, useState } from "react";
import { buildProgressInsight } from "../domain/progress";
import type { GameState, Lang } from "../game";
import { loadStoredSaveReady } from "../infrastructure/save-storage";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function sleepLabel(value: number | null): string {
  return value === null ? "—" : `${value}/10`;
}

export default function ProgressPage() {
  const [state, setState] = useState<GameState | null>(null);
  const [lang, setLang] = useState<Lang>("ru");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    loadStoredSaveReady(localStorage).then((loaded) => {
      if (!active) return;
      if (loaded.state) {
        setState(loaded.state);
        setLang(loaded.state.lang);
      }
      setHydrated(true);
    }).catch(() => {
      if (active) setHydrated(true);
    });
    return () => { active = false; };
  }, []);

  const insight = useMemo(() => state ? buildProgressInsight(state, lang) : null, [state, lang]);

  if (!hydrated) return <main className="progressApp progressEmpty"><p>PROGRESS / LOADING STATE</p></main>;
  if (!state || !insight) {
    return <main className="progressApp progressEmpty"><a href={`${BASE_PATH}/`}>← RECODE</a><section><p>PROGRESS / LOCAL DATA</p><h1>{lang === "ru" ? "НЕТ АКТИВНОГО СОХРАНЕНИЯ" : "NO ACTIVE SAVE"}</h1><p>{lang === "ru" ? "Сначала начни RECODE. Progress не создаёт демонстрационные данные." : "Start RECODE first. Progress does not manufacture demo data."}</p></section></main>;
  }

  const recentTraces = state.consequenceLog.slice(0, 5);

  return <main className="progressApp">
    <header className="progressTop"><a href={`${BASE_PATH}/command/`}>← COMMAND</a><b>PROGRESS</b><button onClick={() => setLang(lang === "ru" ? "en" : "ru")}>{lang.toUpperCase()}</button></header>

    <section className="progressHero">
      <p>HISTORY → SIGNAL → DECISION</p>
      <h1>{lang === "ru" ? "Траектория, а не отчётность." : "Trajectory, not reporting."}</h1>
      <span>{lang === "ru" ? "Здесь остаются только данные, после которых можно принять решение. Нет истории — нет выдуманного вывода." : "Only data that can change a decision stays here. No history means no invented conclusion."}</span>
    </section>

    <section className={`progressDecision confidence-${insight.confidence}`}>
      <div><small>{lang === "ru" ? "ЧТО ДЕЛАТЬ ПОСЛЕ ПРОСМОТРА" : "DECISION AFTER REVIEW"}</small><h2>{insight.confidence === "observed" ? (lang === "ru" ? "Наблюдаемая траектория" : "Observed trajectory") : (lang === "ru" ? "Пока рано делать вывод" : "Too early to conclude")}</h2></div>
      <p>{insight.decision}</p>
    </section>

    <section className="progressTotals" aria-label={lang === "ru" ? "Сводка за четыре недели" : "Four-week summary"}>
      <article><small>{lang === "ru" ? "ЗАВЕРШЕНО" : "COMPLETED"}</small><b>{insight.totalCompleted}</b></article>
      <article><small>{lang === "ru" ? "АДАПТИРОВАНО" : "ADAPTED"}</small><b>{insight.totalAdapted}</b></article>
      <article><small>{lang === "ru" ? "ВОЗВРАТЫ" : "RETURNS"}</small><b>{insight.totalReturns}</b></article>
      <article><small>{lang === "ru" ? "ТРЕНИРОВКИ" : "WORKOUTS"}</small><b>{insight.totalWorkouts}</b></article>
      <article><small>{lang === "ru" ? "СОН · СРЕДНЕЕ" : "SLEEP · AVG"}</small><b>{sleepLabel(insight.averageSleepQuality)}</b><span>{insight.sleepSamples} {lang === "ru" ? "зап." : "samples"}</span></article>
      <article><small>{lang === "ru" ? "СЦЕНЫ" : "SCENES"}</small><b>{insight.storyScenes}</b></article>
    </section>

    <section className="weeklyTrajectory">
      <header><div><small>4 WEEK TRAJECTORY</small><h2>{lang === "ru" ? "Каждая строка — отдельная неделя." : "Each row is one week."}</h2></div><p>{lang === "ru" ? "Числа показаны напрямую вместо декоративного графика." : "Values are shown directly instead of a decorative chart."}</p></header>
      <div className="trajectoryTable" role="table" aria-label={lang === "ru" ? "Траектория по неделям" : "Weekly trajectory"}>
        <div className="trajectoryHeader" role="row"><span role="columnheader">WEEK</span><span role="columnheader">DONE</span><span role="columnheader">ADAPT</span><span role="columnheader">RETURN</span><span role="columnheader">TRAIN</span><span role="columnheader">SLEEP</span></div>
        {insight.weeks.map((week) => <div className="trajectoryRow" role="row" key={`${week.startDay}-${week.endDay}`}><span role="cell"><small>DAYS</small><b>{week.startDay}–{week.endDay}</b></span><span role="cell"><small>DONE</small><b>{week.completed}</b></span><span role="cell"><small>ADAPT</small><b>{week.adapted}</b></span><span role="cell"><small>RETURN</small><b>{week.returns}</b></span><span role="cell"><small>TRAIN</small><b>{week.workouts}</b></span><span role="cell"><small>SLEEP</small><b>{sleepLabel(week.averageSleepQuality)}</b></span></div>)}
      </div>
    </section>

    <section className="progressWorld">
      <div><small>WORLD TRACE</small><h2>{lang === "ru" ? "Что реальные действия уже изменили." : "What real actions already changed."}</h2><p>{lang === "ru" ? "Это журнал фактических последствий, а не отдельная система очков." : "This is a log of actual consequences, not another scoring system."}</p></div>
      <div className="traceList">{recentTraces.length ? recentTraces.map((trace, index) => <article key={`${index}-${trace}`}><span>{String(index + 1).padStart(2, "0")}</span><p>{trace}</p></article>) : <article className="emptyTrace"><p>{lang === "ru" ? "Пока нет world trace. Заверши реальное действие — здесь появится след." : "No world trace yet. Complete a real action and its trace will appear here."}</p></article>}</div>
    </section>
  </main>;
}
