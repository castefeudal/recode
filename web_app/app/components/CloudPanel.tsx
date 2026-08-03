"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { Icon } from "../design-system/Icon";
import type { GameState, Lang } from "../game";
import {
  CloudApiError, authenticate, normalizeApiEndpoint, pushSave, type AuthMode,
} from "../infrastructure/cloud-api";

function messageFor(error: unknown, lang: Lang): string {
  if (error instanceof CloudApiError) {
    if (error.code === "cloud_auth_disabled") return lang === "ru" ? "Cloud-аккаунты ещё не включены владельцем API." : "Cloud accounts are not enabled by the API owner.";
    if (error.code === "invalid_credentials") return lang === "ru" ? "Неверный email или пароль." : "Invalid email or password.";
    if (error.code === "account_exists") return lang === "ru" ? "Аккаунт уже существует." : "The account already exists.";
    if (error.code === "invalid_token") return lang === "ru" ? "Сессия истекла. Войдите снова." : "The session expired. Sign in again.";
    return lang === "ru" ? `Ошибка cloud API: ${error.code}` : `Cloud API error: ${error.code}`;
  }
  if (error instanceof Error && error.message === "cloud_endpoint_requires_https") {
    return lang === "ru" ? "Cloud API должен использовать HTTPS (кроме localhost)." : "Cloud API must use HTTPS (except localhost).";
  }
  return lang === "ru" ? "Не удалось подключиться к API." : "Could not connect to the API.";
}

export function CloudPanel({ state, setState, lang }: {
  state: GameState;
  setState: Dispatch<SetStateAction<GameState>>;
  lang: Lang;
}) {
  const [apiUrl, setApiUrl] = useState(state.cloud.apiUrl);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [access, setAccess] = useState(() => typeof window === "undefined" ? "" : sessionStorage.getItem("recode-cloud-access") ?? "");

  async function signIn(mode: AuthMode) {
    if (!state.cloud.consented) {
      setMessage(lang === "ru" ? "Сначала включите отдельное согласие." : "Enable separate consent first.");
      return;
    }
    setBusy(true);
    try {
      const endpoint = normalizeApiEndpoint(apiUrl);
      const data = await authenticate(endpoint, mode, email, password);
      setAccess(data.access_token);
      sessionStorage.setItem("recode-cloud-access", data.access_token);
      sessionStorage.setItem("recode-cloud-refresh", data.refresh_token);
      setState((previous) => ({ ...previous, cloud: { ...previous.cloud, apiUrl: endpoint } }));
      setMessage(lang === "ru" ? "Сессия активна только в этой вкладке." : "Session active for this tab only.");
    } catch (error) {
      setMessage(messageFor(error, lang));
    } finally {
      setBusy(false);
    }
  }

  async function push() {
    setBusy(true);
    try {
      const endpoint = normalizeApiEndpoint(apiUrl);
      const data = await pushSave(endpoint, access, state);
      setState((previous) => ({ ...previous, cloud: { ...previous.cloud, apiUrl: endpoint, revision: data.revision } }));
      setMessage(lang === "ru" ? "Разрешённые игровые поля синхронизированы." : "Allowlisted game fields synced.");
    } catch (error) {
      if (error instanceof CloudApiError && error.code === "save_conflict") {
        setMessage(`${lang === "ru" ? "Конфликт ревизий" : "Revision conflict"}: ${error.serverRevision ?? "?"}`);
      } else {
        setMessage(messageFor(error, lang));
      }
    } finally {
      setBusy(false);
    }
  }

  return <section className="cloudPanel" aria-busy={busy}>
    <header>
      <div><small>OPTIONAL CLOUD SYNC</small><h2>{lang === "ru" ? "Облако — только по вашему решению." : "Cloud is strictly your choice."}</h2></div>
      <label className="cloudConsent"><input type="checkbox" checked={state.cloud.consented} onChange={(event) => setState((previous) => ({ ...previous, cloud: { ...previous.cloud, consented: event.target.checked } }))} /><span>{lang === "ru" ? "Разрешить sync игровых данных" : "Allow game-data sync"}</span></label>
    </header>
    <p>{lang === "ru" ? "Дневник, питание, сон, адрес API и токены никогда не входят в cloud payload. Сессия хранится только в текущей вкладке." : "Journal, food, sleep, API address and tokens never enter the cloud payload. The session exists only in this tab."}</p>
    <div className="cloudForm">
      <label>{lang === "ru" ? "Адрес API" : "API endpoint"}<input aria-label="Cloud API URL" inputMode="url" value={apiUrl} onChange={(event) => setApiUrl(event.target.value)} placeholder="https://api.example.com" /></label>
      <label>Email<input aria-label="Cloud email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" /></label>
      <label>{lang === "ru" ? "Пароль" : "Password"}<input aria-label="Cloud password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="10+ characters" /></label>
      <div className="cloudActions">
        <button disabled={busy || !state.cloud.consented} onClick={() => signIn("login")}><Icon name="profile" size={16} /> {lang === "ru" ? "Войти" : "Login"}</button>
        <button disabled={busy || !state.cloud.consented} onClick={() => signIn("register")}><Icon name="spark" size={16} /> {lang === "ru" ? "Создать аккаунт" : "Register"}</button>
        <button disabled={busy || !access} onClick={push}><Icon name="sync" size={16} /> {lang === "ru" ? `Синхронизировать · rev ${state.cloud.revision}` : `Sync · rev ${state.cloud.revision}`}</button>
      </div>
    </div>
    {message && <div className="notice" role="status">{message}</div>}
  </section>;
}
