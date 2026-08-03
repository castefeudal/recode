import type { GameState } from "../game";

export type AuthMode = "login" | "register";
export type AuthTokens = {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
  session_id: string;
};
export type SaveResult = { status: "saved"; revision: number; updated_at: string };

type ErrorEnvelope = {
  error?: { code?: string; message?: string; server_revision?: number; max_bytes?: number };
};

export class CloudApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly serverRevision?: number;

  constructor(status: number, envelope: ErrorEnvelope) {
    const detail = envelope.error ?? {};
    super(detail.message ?? detail.code ?? `cloud_http_${status}`);
    this.name = "CloudApiError";
    this.status = status;
    this.code = detail.code ?? "cloud_request_failed";
    this.serverRevision = detail.server_revision;
  }
}

export function normalizeApiEndpoint(value: string): string {
  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed) throw new Error("cloud_endpoint_required");
  const parsed = new URL(trimmed);
  const local = ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
  if (parsed.protocol !== "https:" && !(local && parsed.protocol === "http:")) {
    throw new Error("cloud_endpoint_requires_https");
  }
  return parsed.origin + parsed.pathname.replace(/\/$/, "");
}

async function requestJson<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const envelope = await response.json().catch(() => ({})) as T & ErrorEnvelope;
  if (!response.ok) throw new CloudApiError(response.status, envelope);
  return envelope;
}

export function authenticate(endpoint: string, mode: AuthMode, email: string, password: string): Promise<AuthTokens> {
  return requestJson<AuthTokens>(`${endpoint}/v1/auth/${mode}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

/** Explicit allowlist: journal, food, sleep, cloud endpoint and credentials never enter the payload. */
export function createCloudPayload(state: GameState): Record<string, unknown> {
  return {
    schemaVersion: state.schemaVersion,
    name: state.name,
    origin: state.origin,
    lang: state.lang,
    day: state.day,
    currentSceneId: state.currentSceneId,
    completedScenes: state.completedScenes,
    selectedChoices: state.selectedChoices,
    realActions: state.realActions,
    dailyRecords: state.dailyRecords,
    stats: state.stats,
    xp: state.xp,
    focus: state.focus,
    momentum: state.momentum,
    material: state.material,
    stability: state.stability,
    streak: state.streak,
    returns: state.returns,
    room: state.room,
    skipCount: state.skipCount,
    relationships: state.relationships,
    flags: state.flags,
    pending: state.pending,
    consequenceLog: state.consequenceLog,
    questJournal: state.questJournal,
    activeQuestIds: state.activeQuestIds,
    completedQuestIds: state.completedQuestIds,
    eventHistory: state.eventHistory,
    favoriteExercises: state.favoriteExercises,
    workoutHistory: state.workoutHistory,
    finance: state.finance,
    accessibility: state.accessibility,
    journey: state.journey,
    saveMeta: state.saveMeta,
    endingId: state.endingId,
  };
}

export function pushSave(endpoint: string, accessToken: string, state: GameState): Promise<SaveResult> {
  return requestJson<SaveResult>(`${endpoint}/v1/save`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({
      schema_version: state.schemaVersion,
      expected_revision: state.cloud.revision,
      payload: createCloudPayload(state),
    }),
  });
}
