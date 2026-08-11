"use client";

import { useEffect, useMemo, useState } from "react";
import type { ActionStatus, GameState, Lang } from "../game";
import { loadStoredSaveReady, persistStoredSave } from "../infrastructure/save-storage";
import { loadUserProfile } from "../infrastructure/profile-storage";
import { getDailyRecommendation } from "../domain/recommendation";
import { applyProfileToRecommendation, goalMeta, type UserProfile } from "../domain/profile";
import { buildWeeklyReview } from "../domain/weekly-review";
import { applyReturn, getReturnProtocol, type ReturnScale } from "../domain/return-protocol";

function dayGap(updatedAt: string): number {
  const updated = Date.parse(updatedAt);
  if (!Number.isFinite(updated)) return 0;
  return Math.max(0, Math.floor((Date.now() - updated) / 86_400_000));
}

export default function CommandCenterPage() {
  const [state, setState] = useState<GameState | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [lang, setLang] = useState<Lang>("ru");
  const [hydrated, setHydrated] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let active = true;
    setProfile(loadUserProfile(localStorage));
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

  useEffect(() => {
    if (!hydrated || !state) return;
    persistStoredSave(localStorage, state, lang);
  }, [hydrated, state, lang]);

  const recommendation = useMemo(() => {
    if (!state || !profile) return null;
    return applyProfileToRecommendation(getDailyRecommendation(state, lang), profile, lang);
  }, [state, profile, lang]);
  const review = useMemo(() => state ? buildWeeklyReview(state, lang, recommendation?.title) : null, [state, lang, recommendation?.title]);
  const returnProtocol = useMemo(() => state ? getReturnProtocol(state, lang, dayGap(state.saveMeta.updatedAt)) : null, [state, lang]);

  if (!hydrated) {
    return <main className="commandCenter commandLoading"><p>RECODE / LOADING STATE</p></main>;
  }

  if (!state || !recommendation || !review || !returnProtocol || !profile) {
    return <main className="commandCenter commandEmpty">
      <a className="commandBack" href="../">← MARKOVMADE: RECODE</a>
      <section>
        <p className="commandEyebrow">DAILY COMMAND CENTER</p>
        <h1>{lang === "ru" ? "Сначала создай точку А." : "Create your Point A first."}</h1>
        <p>{lang === "ru" ? "Command Center использует только реальные данные твоего локального сохранения. Без истории он не выдумывает персональные выводы." : "Command Center only uses real data from your local save. Without history, it does not invent personal insights."}</p>
        <a className="commandPrimary" href="../">{lang === "ru" ? "Начать RECODE" : "Start RECODE"}</a>
      </section>
    </main>;
  }

  function record(statusValue: ActionStatus) {
    if (!state || !recommendation) return;
    if (state.dailyRecords.some((record) => record.day === state.day && record.actionId === recommendation.actionId)) {
      setStatus(lang === "ru" ? "Это действие уже записано сегодня." : "This action is already recorded today.");
      return;
    }
    const acted = ["completed", "reduced", "replaced"].includes(statusValue);
    setState({
      ...state,
      dailyRecords: [...state.dailyRecords, { actionId: recommendation.actionId, status: statusValue, day: state.day }],
      xp: state.xp + (statusValue === "completed" ? 18 : acted ? 10 : 0),
      stability: Math.min(100, state.stability + (acted ? 3 : 0)),
      skipCount: state.skipCount + (statusValue === "skipped" ? 1 : 0),
      journey: {
        ...state.journey,
        firstRealActionDone: acted || state.journey.firstRealActionDone,
        firstArcCompleted: state.journey.firstChoiceMade && (acted || state.journey.firstRealActionDone),
      },
      flags: {
        ...state.flags,
        [`daily.${recommendation.actionId}.${statusValue}`]: true,
      },
      consequenceLog: [
        lang === "ru"
          ? `Daily Protocol: ${recommendation.title} — ${statusValue}. Meridian получил новый след.`
          : `Daily Protocol: ${recommendation.title} — ${statusValue}. Meridian received a new trace.`,
        ...state.consequenceLog,
      ].slice(0, 40),
    });
    setStatus(lang === "ru" ? "Записано. Следующий протокол адаптируется к этому решению." : "Recorded. The next protocol will adapt to this decision.");
  }

  function completeReturn(scale: ReturnScale) {
    setState((current) => current ? applyReturn(current, scale) : current);
    setStatus(lang === "ru" ? "Возвращение записано. Прогресс не обнулён." : "Return recorded. Your progress was not reset.");
  }

  const priorityLabel = recommendation.priority.toUpperCase();
  const readinessLabel = recommendation.readinessState.toUpperCase();
  const worldState = state.journey.firstArcCompleted
    ? (lang === "ru" ? "МИР ОТВЕТИЛ" : "WORLD RESPONDED")
    : state.journey.firstRealActionDone
      ? (lang === "ru" ? "СЛЕД ЗАПИСАН" : "TRACE RECORDED")
      : (lang === "ru" ? "МИР ЖДЁТ ДЕЙСТВИЕ" : "WORLD AWAITS ACTION");

  return <main className="commandCenter">
    <header className="commandTop">
      <a className="commandBrand" href="../"><small>MARKOVMADE</small><b>RECODE</b></a>
      <div><span>DAY {String(state.day).padStart(2, "0")}</span><span>{state.name}</span><a className="commandProfileLink" href="../setup/">{goalMeta[profile.primaryGoal][lang]} · {profile.availableMinutes} MIN</a><button onClick={() => setLang(lang === "ru" ? "en" : "ru")}>{lang.toUpperCase()}</button></div>
    </header>

    <section className="commandIntro">
      <p className="commandEyebrow">STATE → PRIORITY → ACTION → WORLD</p>
      <h1>{lang === "ru" ? "Сегодня не нужен максимум." : "Today does not require your maximum."}</h1>
      <p>{lang === "ru" ? "Нужен один законченный цикл, который соответствует твоему состоянию, доступному времени и выбранным модулям." : "You need one completed loop that matches your state, available time and enabled modules."}</p>
    </section>

    {returnProtocol.active && <section className="returnProtocol" aria-labelledby="return-title">
      <div>
        <p className="commandEyebrow">RETURN PROTOCOL</p>
        <h2 id="return-title">{returnProtocol.title}</h2>
        <p>{returnProtocol.message}</p>
      </div>
      <div className="returnOptions">{returnProtocol.options.map((option) => <button key={option.scale} onClick={() => completeReturn(option.scale)}><small>{option.label}</small><b>{option.minutes} MIN</b></button>)}</div>
    </section>}

    <section className="commandGrid">
      <article className="priorityCard">
        <header><span>{lang === "ru" ? "ПРИОРИТЕТ" : "PRIORITY"}</span><b>{priorityLabel}</b></header>
        <div className={`readiness readiness-${recommendation.readinessState}`}><small>READINESS</small><strong>{readinessLabel}</strong></div>
        <p>{recommendation.reason}</p>
        <footer><span>{lang === "ru" ? "УВЕРЕННОСТЬ" : "CONFIDENCE"}</span><b>{recommendation.confidence.toUpperCase()}</b></footer>
      </article>

      <article className="nextActionCard">
        <p className="commandEyebrow">NEXT BEST ACTION</p>
        <div className="actionTime"><strong>{recommendation.minutes}</strong><span>MIN</span></div>
        <h2>{recommendation.title}</h2>
        <p className="whyLabel">WHY THIS</p>
        <p>{recommendation.reason}</p>
        <button className="commandPrimary" onClick={() => record("completed")}>{lang === "ru" ? "Выполнено" : "Complete"}</button>
        <div className="actionAlternatives">{recommendation.alternatives.map((item) => <button key={item.status} onClick={() => record(item.status)}><span>{item.label}</span>{item.minutes > 0 && <small>{Math.min(item.minutes, profile.availableMinutes)} MIN</small>}</button>)}</div>
      </article>
    </section>

    <section className="worldResponse">
      <div>
        <p className="commandEyebrow">WORLD RESPONSE</p>
        <h2>{worldState}</h2>
        <p>{state.consequenceLog[0] ?? (lang === "ru" ? "Сделай одно реальное действие — Meridian получит первый новый след." : "Take one real action and Meridian will receive its first new trace.")}</p>
      </div>
      <div className="loopTrack"><span className={state.journey.firstChoiceMade ? "done" : ""}>CHOICE</span><i>→</i><span className={state.journey.firstRealActionDone ? "done" : ""}>ACTION</span><i>→</i><span className={state.journey.firstArcCompleted ? "done" : ""}>WORLD</span></div>
    </section>

    <section className="weeklyReview">
      <header><div><p className="commandEyebrow">WEEK {String(review.week).padStart(2, "0")} REVIEW</p><h2>{lang === "ru" ? "Траектория, а не серия." : "Trajectory, not streak."}</h2></div><b>{review.returns} {lang === "ru" ? "ВОЗВР." : "RETURNS"}</b></header>
      <div className="reviewMetrics"><span><small>{lang === "ru" ? "ЗАВЕРШЕНО" : "COMPLETED"}</small><b>{review.completedActions}</b></span><span><small>{lang === "ru" ? "АДАПТИРОВАНО" : "ADAPTED"}</small><b>{review.reducedActions}</b></span><span><small>{lang === "ru" ? "ТРЕНИРОВКИ" : "WORKOUTS"}</small><b>{review.workouts}</b></span><span><small>{lang === "ru" ? "СОН" : "SLEEP"}</small><b>{review.averageSleepQuality ?? "—"}</b></span></div>
      <div className="reviewColumns"><div><small>WINS</small>{review.wins.map((item) => <p key={item}>{item}</p>)}</div><div><small>FRICTION</small>{review.friction.length ? review.friction.map((item) => <p key={item}>{item}</p>) : <p>{lang === "ru" ? "Недостаточно данных для устойчивого вывода." : "Not enough data for a stable conclusion."}</p>}</div><div><small>NEXT WEEK</small><p>{review.nextFocus}</p></div></div>
      {review.observation && <aside><b>{lang === "ru" ? "НАБЛЮДЕНИЕ" : "OBSERVATION"}</b><p>{review.observation}</p><small>{review.disclaimer}</small></aside>}
    </section>

    {status && <div className="commandToast" role="status" aria-live="polite">{status}</div>}
  </main>;
}
