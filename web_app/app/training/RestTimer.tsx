"use client";

import { useEffect, useState } from "react";

export function RestTimer({ seconds, lang }: { seconds: number; lang: "ru" | "en" }) {
  const safeSeconds = Math.max(15, Math.min(600, Math.round(seconds || 90)));
  const [remaining, setRemaining] = useState(safeSeconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setRemaining(safeSeconds);
    setRunning(false);
  }, [safeSeconds]);

  useEffect(() => {
    if (!running || remaining <= 0) return;
    const id = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(id);
  }, [running, remaining]);

  useEffect(() => {
    if (remaining === 0) setRunning(false);
  }, [remaining]);

  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return <section className={`restTimer ${remaining === 0 ? "done" : ""}`} aria-label={lang === "ru" ? "Таймер отдыха" : "Rest timer"}>
    <div><small>REST</small><b>{String(minutes).padStart(2, "0")}:{String(secs).padStart(2, "0")}</b></div>
    <div>
      <button onClick={() => setRunning((value) => !value)}>{running ? (lang === "ru" ? "Пауза" : "Pause") : remaining === 0 ? (lang === "ru" ? "Готово" : "Done") : (lang === "ru" ? "Старт" : "Start")}</button>
      <button onClick={() => { setRemaining(safeSeconds); setRunning(false); }}>{lang === "ru" ? "Сброс" : "Reset"}</button>
    </div>
  </section>;
}
