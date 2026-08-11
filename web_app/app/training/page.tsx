"use client";

import { useEffect, useMemo, useState } from "react";
import { addExerciseToDraft, completeWorkout, formatPreviousResult, moveDraftExercise, previousExerciseResult, recordSet, startWorkout, templateMeta, type ExerciseSummary, type TrainingState, type TrainingTemplate } from "../domain/training";
import { recordCompletedWorkoutInGame } from "../infrastructure/training-game-bridge";
import { loadTrainingState, persistTrainingState } from "../infrastructure/training-storage";
import { RestTimer } from "./RestTimer";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function TrainingPage() {
  const [all, setAll] = useState<ExerciseSummary[]>([]);
  const [state, setState] = useState<TrainingState | null>(null);
  const [query, setQuery] = useState("");
  const [template, setTemplate] = useState<TrainingTemplate>("custom");
  const [lang, setLang] = useState<"ru" | "en">("ru");
  const [activeIndex, setActiveIndex] = useState(0);
  const [reps, setReps] = useState(8);
  const [load, setLoad] = useState(0);
  const [rir, setRir] = useState(3);

  useEffect(() => {
    setState(loadTrainingState(localStorage));
    fetch(`${BASE_PATH}/content/exercises.json?v=7.0.0`).then((response) => response.json()).then((data) => setAll(data.exercises ?? [])).catch(() => setAll([]));
  }, []);

  useEffect(() => {
    if (state) persistTrainingState(localStorage, state);
  }, [state]);

  const filtered = useMemo(() => all.filter((exercise) => {
    const haystack = `${exercise.name.ru} ${exercise.name.en} ${exercise.body_part} ${exercise.target_muscle} ${exercise.equipment}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  }).slice(0, 40), [all, query]);

  if (!state) return <main className="trainingApp"><p>TRAINING / LOADING</p></main>;

  const active = state.activeSession;
  const activeExercise = active?.exercises[activeIndex] ?? null;
  const previous = activeExercise ? previousExerciseResult(state.history, activeExercise.exerciseId) : null;

  function updateDraft(index: number, patch: Partial<TrainingState["draft"][number]>) {
    setState((current) => current ? { ...current, draft: current.draft.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) } : current);
  }

  function begin() {
    if (!state.draft.length) return;
    setState({ ...state, activeSession: startWorkout(state.draft, template, templateMeta[template][lang]) });
    setActiveIndex(0);
  }

  function saveSet() {
    if (!active || !activeExercise) return;
    setState({ ...state, activeSession: recordSet(active, activeIndex, { reps, load: load || null, rir }) });
  }

  function finish() {
    if (!active) return;
    const completed = completeWorkout(active);
    void recordCompletedWorkoutInGame(localStorage, completed);
    setState({ ...state, activeSession: null, history: [completed, ...state.history].slice(0, 100) });
    setActiveIndex(0);
  }

  if (active && activeExercise) {
    return <main className="trainingApp sessionMode">
      <header className="trainingTop"><a href={`${BASE_PATH}/command/`}>← COMMAND</a><span>{active.name}</span><button onClick={() => setLang(lang === "ru" ? "en" : "ru")}>{lang.toUpperCase()}</button></header>
      <section className="sessionExercise">
        <p>EXERCISE {activeIndex + 1} / {active.exercises.length}</p>
        <h1>{activeExercise.name}</h1>
        <div className="previousResult"><small>LAST TIME</small><b>{formatPreviousResult(previous)}</b></div>
        <div className="setInputs"><label>LOAD<input inputMode="decimal" type="number" min="0" value={load} onChange={(e) => setLoad(Number(e.target.value))} /></label><label>REPS<input inputMode="numeric" type="number" min="1" value={reps} onChange={(e) => setReps(Number(e.target.value))} /></label><label>RIR<input inputMode="numeric" type="number" min="0" max="10" value={rir} onChange={(e) => setRir(Number(e.target.value))} /></label></div>
        <button className="trainingPrimary" onClick={saveSet}>＋ {lang === "ru" ? "Записать подход" : "Record set"}</button>
        <RestTimer seconds={activeExercise.restSeconds} lang={lang} />
        <div className="setHistory">{activeExercise.setsDone.map((set, index) => <span key={set.completedAt}><small>SET {index + 1}</small><b>{set.load ?? "BW"} × {set.reps}</b><em>RIR {set.rir ?? "—"}</em></span>)}</div>
        <footer className="sessionNav"><button disabled={activeIndex === 0} onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}>← {lang === "ru" ? "Назад" : "Previous"}</button>{activeIndex < active.exercises.length - 1 ? <button onClick={() => setActiveIndex(activeIndex + 1)}>{lang === "ru" ? "Следующее" : "Next"} →</button> : <button className="trainingPrimary" onClick={finish}>{lang === "ru" ? "Завершить тренировку" : "Finish workout"}</button>}</footer>
      </section>
    </main>;
  }

  return <main className="trainingApp">
    <header className="trainingTop"><a href={`${BASE_PATH}/command/`}>← COMMAND</a><b>TRAINING</b><button onClick={() => setLang(lang === "ru" ? "en" : "ru")}>{lang.toUpperCase()}</button></header>
    <section className="trainingHero"><p>BUILD → TRAIN → RECORD → PROGRESS</p><h1>{lang === "ru" ? "Тренировка без лишнего интерфейса." : "Training without interface overhead."}</h1><span>{lang === "ru" ? "Собери план, проведи сессию одной рукой и всегда сверяйся с прошлым результатом." : "Build a plan, run the session one-handed, and always see the previous result."}</span></section>
    <section className="templateStrip">{(Object.keys(templateMeta) as TrainingTemplate[]).map((id) => <button className={template === id ? "active" : ""} key={id} onClick={() => setTemplate(id)}>{templateMeta[id][lang]}</button>)}</section>
    <section className="trainingLayout">
      <div className="workoutBuilder"><header><div><small>WORKOUT BUILDER</small><h2>{templateMeta[template][lang]}</h2></div><button className="trainingPrimary" disabled={!state.draft.length} onClick={begin}>{lang === "ru" ? "Начать" : "Start"}</button></header>{state.draft.length === 0 ? <div className="trainingEmpty"><b>{lang === "ru" ? "План пуст" : "Empty plan"}</b><p>{lang === "ru" ? "Найди упражнение справа и добавь его. Ничего не назначается автоматически." : "Find an exercise on the right and add it. Nothing is prescribed automatically."}</p></div> : <div className="draftList">{state.draft.map((item, index) => <article key={item.exerciseId}><div><small>{String(index + 1).padStart(2, "0")}</small><h3>{item.name}</h3></div><label>SETS<input type="number" min="1" max="10" value={item.sets} onChange={(e) => updateDraft(index, { sets: Number(e.target.value) })} /></label><label>REPS<input type="number" min="1" max="50" value={item.reps} onChange={(e) => updateDraft(index, { reps: Number(e.target.value) })} /></label><label>REST<input type="number" min="15" step="15" value={item.restSeconds} onChange={(e) => updateDraft(index, { restSeconds: Number(e.target.value) })} /></label><div className="draftMove"><button disabled={index === 0} onClick={() => setState({ ...state, draft: moveDraftExercise(state.draft, index, -1) })}>↑</button><button disabled={index === state.draft.length - 1} onClick={() => setState({ ...state, draft: moveDraftExercise(state.draft, index, 1) })}>↓</button><button onClick={() => setState({ ...state, draft: state.draft.filter((_, i) => i !== index) })}>×</button></div></article>)}</div>}</div>
      <aside className="exerciseBrowser"><header><small>1 324 EXERCISES · LAZY FEATURE LOAD</small><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={lang === "ru" ? "Упражнение, мышца, оборудование…" : "Exercise, muscle, equipment…"} /></header><div>{filtered.map((exercise) => <article key={exercise.id}><div><small>{exercise.body_part} · {exercise.equipment}</small><h3>{exercise.name[lang]}</h3><p>{exercise.target_muscle}</p></div><button onClick={() => setState({ ...state, draft: addExerciseToDraft(state.draft, exercise) })}>＋</button></article>)}</div></aside>
    </section>
    {state.history.length > 0 && <section className="trainingHistory"><small>RECENT SESSIONS</small>{state.history.slice(0, 8).map((session) => <article key={session.id}><div><b>{session.name}</b><span>{new Date(session.startedAt).toLocaleDateString(lang === "ru" ? "ru-RU" : "en-US")}</span></div><strong>{session.exercises.reduce((sum, exercise) => sum + exercise.setsDone.length, 0)} SETS</strong></article>)}</section>}
  </main>;
}
