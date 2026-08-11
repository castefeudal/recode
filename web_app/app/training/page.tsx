"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { addExerciseToDraft, buildTemplateDraft, completeWorkout, formatPreviousResult, moveDraftExercise, previousExerciseResult, recordSet, startWorkout, templateMeta, type ExerciseSummary, type TrainingState, type TrainingTemplate } from "../domain/training";
import { recordCompletedWorkoutInGame } from "../infrastructure/training-game-bridge";
import { loadTrainingState, persistTrainingState } from "../infrastructure/training-storage";
import { RestTimer } from "./RestTimer";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
type LibraryStatus = "idle" | "loading" | "ready" | "error";

export default function TrainingPage() {
  const [all, setAll] = useState<ExerciseSummary[]>([]);
  const [libraryStatus, setLibraryStatus] = useState<LibraryStatus>("idle");
  const [state, setState] = useState<TrainingState | null>(null);
  const [query, setQuery] = useState("");
  const [template, setTemplate] = useState<TrainingTemplate>("custom");
  const [lang, setLang] = useState<"ru" | "en">("ru");
  const [activeIndex, setActiveIndex] = useState(0);
  const [reps, setReps] = useState(8);
  const [load, setLoad] = useState(0);
  const [rir, setRir] = useState(3);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const requestLibrary = useCallback(() => {
    setLibraryStatus("loading");
    fetch(`${BASE_PATH}/content/exercises.json?v=7.0.0`)
      .then((response) => {
        if (!response.ok) throw new Error(`exercise_library_${response.status}`);
        return response.json();
      })
      .then((data) => {
        const exercises = Array.isArray(data.exercises) ? data.exercises as ExerciseSummary[] : [];
        if (!exercises.length) throw new Error("exercise_library_empty");
        setAll(exercises);
        setLibraryStatus("ready");
      })
      .catch(() => {
        setAll([]);
        setLibraryStatus("error");
      });
  }, []);

  useEffect(() => {
    const loaded = loadTrainingState(localStorage);
    setState(loaded);
    if (!loaded.activeSession) requestLibrary();
  }, [requestLibrary]);

  useEffect(() => {
    if (state) persistTrainingState(localStorage, state);
  }, [state]);

  const filtered = useMemo(() => all.filter((exercise) => {
    const haystack = `${exercise.name.ru} ${exercise.name.en} ${exercise.body_part} ${exercise.target_muscle} ${exercise.equipment}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  }).slice(0, 40), [all, query]);

  if (!state) return <main className="trainingApp"><p>TRAINING / LOADING</p></main>;

  const active = state.activeSession;
  const activeExercise = active?.exercises[activeIndex] ?? null;
  const previous = activeExercise ? previousExerciseResult(state.history, activeExercise.exerciseId) : null;
  const selectedExercise = selectedExerciseId ? all.find((exercise) => exercise.id === selectedExerciseId) ?? null : null;
  const selectedPrevious = selectedExercise ? previousExerciseResult(state.history, selectedExercise.id) : null;
  const alternatives = selectedExercise ? all.filter((exercise) => exercise.id !== selectedExercise.id && exercise.target_muscle === selectedExercise.target_muscle).slice(0, 4) : [];

  function updateDraft(index: number, patch: Partial<TrainingState["draft"][number]>) {
    setState((current) => current ? { ...current, draft: current.draft.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) } : current);
  }

  function applySelectedTemplate() {
    if (!state) return;
    if (template === "custom") {
      setMessage(lang === "ru" ? "Custom оставляет план полностью ручным." : "Custom keeps the plan fully manual.");
      return;
    }
    if (libraryStatus !== "ready") {
      requestLibrary();
      setMessage(lang === "ru" ? "Библиотека упражнений загружается. Повтори после загрузки." : "The exercise library is loading. Try again when it is ready.");
      return;
    }
    const draft = buildTemplateDraft(all, template, lang);
    if (!draft.length) {
      setMessage(lang === "ru" ? "Для этого шаблона не найдено достаточно подходящих упражнений. Собери план вручную." : "No suitable exercises were found for this template. Build it manually instead.");
      return;
    }
    setState((current) => current ? { ...current, draft } : current);
    setMessage(lang === "ru" ? "Стартовая структура создана. Измени упражнения, подходы и повторы под себя — это не медицинское или научное назначение." : "Starter structure created. Edit exercises, sets and reps for your context; this is not a medical or scientific prescription.");
  }

  function begin() {
    if (!state || !state.draft.length) return;
    const session = startWorkout(state.draft, template, templateMeta[template][lang]);
    const first = session.exercises[0];
    setState((current) => current ? { ...current, activeSession: session } : current);
    setActiveIndex(0);
    setReps(first?.reps ?? 8);
    setLoad(first?.load ?? 0);
    setRir(first?.rir ?? 3);
    setMessage("");
  }

  function saveSet() {
    if (!state || !active || !activeExercise) return;
    const safeReps = Math.max(1, Math.min(100, Math.round(reps || 1)));
    const safeLoad = Number.isFinite(load) && load > 0 ? Math.min(2000, load) : null;
    const safeRir = Number.isFinite(rir) ? Math.max(0, Math.min(10, Math.round(rir))) : null;
    setState((current) => current?.activeSession ? { ...current, activeSession: recordSet(current.activeSession, activeIndex, { reps: safeReps, load: safeLoad, rir: safeRir }) } : current);
    setMessage(lang === "ru" ? "Подход записан локально." : "Set recorded locally.");
  }

  function goToExercise(index: number) {
    if (!active) return;
    const target = active.exercises[index];
    if (!target) return;
    setActiveIndex(index);
    setReps(target.reps);
    setLoad(target.load ?? 0);
    setRir(target.rir ?? 3);
    setMessage("");
  }

  function finish() {
    if (!state || !active) return;
    const completed = completeWorkout(active);
    void recordCompletedWorkoutInGame(localStorage, completed);
    setState((current) => current ? { ...current, activeSession: null, history: [completed, ...current.history].slice(0, 100) } : current);
    setActiveIndex(0);
    setMessage(lang === "ru" ? "Тренировка завершена. Daily Command и Weekly Review получили новый след." : "Workout completed. Daily Command and Weekly Review received a new trace.");
    if (libraryStatus !== "ready") requestLibrary();
  }

  function toggleFavourite(exerciseId: string) {
    setState((current) => {
      if (!current) return current;
      const exists = current.favouriteExerciseIds.includes(exerciseId);
      return {
        ...current,
        favouriteExerciseIds: exists
          ? current.favouriteExerciseIds.filter((id) => id !== exerciseId)
          : [exerciseId, ...current.favouriteExerciseIds].slice(0, 500),
      };
    });
  }

  function updateSessionNotes(notes: string) {
    setState((current) => current?.activeSession ? { ...current, activeSession: { ...current.activeSession, notes: notes.slice(0, 1000) } } : current);
  }

  if (active && activeExercise) {
    const plannedDone = activeExercise.setsDone.length >= activeExercise.sets;
    return <main className="trainingApp sessionMode">
      <header className="trainingTop"><a href={`${BASE_PATH}/command/`}>← COMMAND</a><span>{active.name}</span><button onClick={() => setLang(lang === "ru" ? "en" : "ru")}>{lang.toUpperCase()}</button></header>
      <section className="sessionExercise">
        <p>EXERCISE {activeIndex + 1} / {active.exercises.length}</p>
        <h1>{activeExercise.name}</h1>
        <div className="previousResult"><small>{lang === "ru" ? "ПРОШЛЫЙ РЕЗУЛЬТАТ" : "LAST TIME"}</small><b>{formatPreviousResult(previous)}</b></div>
        {activeExercise.notes && <p className="exerciseCue">{activeExercise.notes}</p>}
        <div className="setInputs"><label>LOAD<input inputMode="decimal" type="number" min="0" max="2000" value={load} onChange={(event) => setLoad(Number(event.target.value))} /></label><label>REPS<input inputMode="numeric" type="number" min="1" max="100" value={reps} onChange={(event) => setReps(Number(event.target.value))} /></label><label>RIR<input inputMode="numeric" type="number" min="0" max="10" value={rir} onChange={(event) => setRir(Number(event.target.value))} /></label></div>
        <button className="trainingPrimary" onClick={saveSet}>＋ {plannedDone ? (lang === "ru" ? "Дополнительный подход" : "Extra set") : (lang === "ru" ? `Записать подход ${activeExercise.setsDone.length + 1}/${activeExercise.sets}` : `Record set ${activeExercise.setsDone.length + 1}/${activeExercise.sets}`)}</button>
        <RestTimer key={activeExercise.exerciseId} seconds={activeExercise.restSeconds} lang={lang} />
        <div className="setHistory">{activeExercise.setsDone.map((set, index) => <span key={set.completedAt}><small>SET {index + 1}</small><b>{set.load ?? "BW"} × {set.reps}</b><em>RIR {set.rir ?? "—"}</em></span>)}</div>
        <label className="sessionNotes"><span>{lang === "ru" ? "ЗАМЕТКА О СЕССИИ" : "SESSION NOTE"}</span><textarea value={active.notes} maxLength={1000} onChange={(event) => updateSessionNotes(event.target.value)} placeholder={lang === "ru" ? "Техника, самочувствие, что изменить в следующий раз…" : "Technique, how it felt, what to change next time…"} /></label>
        <footer className="sessionNav"><button disabled={activeIndex === 0} onClick={() => goToExercise(Math.max(0, activeIndex - 1))}>← {lang === "ru" ? "Назад" : "Previous"}</button>{activeIndex < active.exercises.length - 1 ? <button onClick={() => goToExercise(activeIndex + 1)}>{lang === "ru" ? "Следующее" : "Next"} →</button> : <button className="trainingPrimary" onClick={finish}>{lang === "ru" ? "Завершить тренировку" : "Finish workout"}</button>}</footer>
      </section>
      {message && <div className="trainingStatus" role="status" aria-live="polite">{message}</div>}
    </main>;
  }

  return <main className="trainingApp">
    <header className="trainingTop"><a href={`${BASE_PATH}/command/`}>← COMMAND</a><b>TRAINING</b><button onClick={() => setLang(lang === "ru" ? "en" : "ru")}>{lang.toUpperCase()}</button></header>
    <section className="trainingHero"><p>BUILD → TRAIN → RECORD → PROGRESS</p><h1>{lang === "ru" ? "Тренировка без лишнего интерфейса." : "Training without interface overhead."}</h1><span>{lang === "ru" ? "Собери план, проведи сессию одной рукой и всегда сверяйся с прошлым результатом." : "Build a plan, run the session one-handed, and always see the previous result."}</span></section>
    <section className="templateStrip">{(Object.keys(templateMeta) as TrainingTemplate[]).map((id) => <button className={template === id ? "active" : ""} aria-pressed={template === id} key={id} onClick={() => setTemplate(id)}>{templateMeta[id][lang]}</button>)}</section>
    <section className="trainingLayout">
      <div className="workoutBuilder"><header><div><small>WORKOUT BUILDER</small><h2>{templateMeta[template][lang]}</h2><p>{lang === "ru" ? "Шаблоны — редактируемая стартовая структура, не автоматическое назначение программы." : "Templates are editable starting structures, not automatic programming prescriptions."}</p></div><div className="builderActions">{template !== "custom" && <button className="outlineTrainingButton" onClick={applySelectedTemplate}>{lang === "ru" ? "Заполнить шаблон" : "Apply template"}</button>}<button className="trainingPrimary" disabled={!state.draft.length} onClick={begin}>{lang === "ru" ? "Начать" : "Start"}</button></div></header>{state.draft.length === 0 ? <div className="trainingEmpty"><b>{lang === "ru" ? "План пуст" : "Empty plan"}</b><p>{lang === "ru" ? "Применяй шаблон или найди упражнения справа. Ничего не назначается автоматически." : "Apply a template or add exercises from the library. Nothing is prescribed automatically."}</p></div> : <div className="draftList">{state.draft.map((item, index) => <article key={item.exerciseId}><div><small>{String(index + 1).padStart(2, "0")}</small><h3>{item.name}</h3></div><label>SETS<input type="number" min="1" max="10" value={item.sets} onChange={(event) => updateDraft(index, { sets: Number(event.target.value) })} /></label><label>REPS<input type="number" min="1" max="100" value={item.reps} onChange={(event) => updateDraft(index, { reps: Number(event.target.value) })} /></label><label>REST<input type="number" min="15" max="600" step="15" value={item.restSeconds} onChange={(event) => updateDraft(index, { restSeconds: Number(event.target.value) })} /></label><input className="draftNotes" value={item.notes} maxLength={1000} onChange={(event) => updateDraft(index, { notes: event.target.value })} placeholder={lang === "ru" ? "Заметка / техника" : "Note / technique"} aria-label={lang === "ru" ? `Заметка для ${item.name}` : `Note for ${item.name}`} /><div className="draftMove"><button aria-label={lang === "ru" ? "Выше" : "Move up"} disabled={index === 0} onClick={() => setState((current) => current ? { ...current, draft: moveDraftExercise(current.draft, index, -1) } : current)}>↑</button><button aria-label={lang === "ru" ? "Ниже" : "Move down"} disabled={index === state.draft.length - 1} onClick={() => setState((current) => current ? { ...current, draft: moveDraftExercise(current.draft, index, 1) } : current)}>↓</button><button aria-label={lang === "ru" ? `Удалить ${item.name}` : `Remove ${item.name}`} onClick={() => setState((current) => current ? { ...current, draft: current.draft.filter((_, itemIndex) => itemIndex !== index) } : current)}>×</button></div></article>)}</div>}</div>
      <aside className="exerciseBrowser"><header><small>1 324 EXERCISES · FEATURE LOAD</small><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={lang === "ru" ? "Упражнение, мышца, оборудование…" : "Exercise, muscle, equipment…"} />{libraryStatus === "error" && <button className="libraryRetry" onClick={requestLibrary}>{lang === "ru" ? "Повторить загрузку" : "Retry library"}</button>}</header><div>{libraryStatus === "loading" ? <p className="libraryState">{lang === "ru" ? "Загрузка библиотеки…" : "Loading library…"}</p> : libraryStatus === "error" ? <p className="libraryState">{lang === "ru" ? "Библиотека недоступна. Сохранённая тренировка и история продолжают работать." : "Library unavailable. Saved workouts and history still work."}</p> : filtered.length === 0 ? <p className="libraryState">{lang === "ru" ? "Ничего не найдено. Измени запрос." : "No exercises found. Change the query."}</p> : filtered.map((exercise) => { const favourite = state.favouriteExerciseIds.includes(exercise.id); return <article key={exercise.id}><button className="exerciseOpen" onClick={() => setSelectedExerciseId(exercise.id)}><small>{exercise.body_part} · {exercise.equipment}</small><h3>{exercise.name[lang]}</h3><p>{exercise.target_muscle}</p></button><div className="exerciseCardActions"><button aria-label={favourite ? (lang === "ru" ? "Убрать из избранного" : "Remove favourite") : (lang === "ru" ? "В избранное" : "Favourite")} aria-pressed={favourite} onClick={() => toggleFavourite(exercise.id)}>{favourite ? "★" : "☆"}</button><button aria-label={lang === "ru" ? `Добавить ${exercise.name[lang]}` : `Add ${exercise.name[lang]}`} onClick={() => setState((current) => current ? { ...current, draft: addExerciseToDraft(current.draft, exercise, lang) } : current)}>＋</button></div></article>; })}</div></aside>
    </section>

    {selectedExercise && <section className="exerciseDetail" aria-labelledby="exercise-detail-title">
      <header><div><small>{selectedExercise.body_part} · {selectedExercise.equipment}</small><h2 id="exercise-detail-title">{selectedExercise.name[lang]}</h2><p>{selectedExercise.target_muscle}{selectedExercise.secondary_muscles.length ? ` · ${selectedExercise.secondary_muscles.join(", ")}` : ""}</p></div><button aria-label={lang === "ru" ? "Закрыть упражнение" : "Close exercise details"} onClick={() => setSelectedExerciseId(null)}>×</button></header>
      <div className="exerciseDetailGrid"><div><small>{lang === "ru" ? "ТЕХНИКА" : "TECHNIQUE"}</small>{selectedExercise.instructions[lang].slice(0, 6).map((instruction, index) => <p key={`${index}-${instruction}`}>{index + 1}. {instruction}</p>)}</div><div><small>{lang === "ru" ? "БЕЗОПАСНОСТЬ" : "SAFETY"}</small><p>{selectedExercise.safety.pain_response[lang]}</p><small>{lang === "ru" ? "ПОСЛЕДНИЙ РЕЗУЛЬТАТ" : "RECENT RESULT"}</small><p>{formatPreviousResult(selectedPrevious)}</p></div><div><small>{lang === "ru" ? "АЛЬТЕРНАТИВЫ" : "ALTERNATIVES"}</small>{alternatives.length ? alternatives.map((exercise) => <button key={exercise.id} onClick={() => setSelectedExerciseId(exercise.id)}>{exercise.name[lang]}</button>) : <p>{lang === "ru" ? "Подходящие альтернативы не найдены." : "No matching alternatives found."}</p>}</div></div>
    </section>}

    {state.history.length > 0 && <section className="trainingHistory"><small>RECENT SESSIONS</small>{state.history.slice(0, 8).map((session) => <article key={session.id}><div><b>{session.name}</b><span>{new Date(session.startedAt).toLocaleDateString(lang === "ru" ? "ru-RU" : "en-US")}</span>{session.notes && <p>{session.notes}</p>}</div><strong>{session.exercises.reduce((sum, exercise) => sum + exercise.setsDone.length, 0)} SETS</strong></article>)}</section>}
    {message && <div className="trainingStatus" role="status" aria-live="polite">{message}</div>}
  </main>;
}
