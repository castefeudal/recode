"""MARKOVMADE: RECODE optional cloud API.

The game remains offline-complete. Cloud features are disabled by default and
must be explicitly enabled by the owner. Sensitive local journals, nutrition
and sleep records are not required by this API and are excluded by the Web
client's allowlist.
"""
from __future__ import annotations

from collections import defaultdict, deque
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from hashlib import sha256, scrypt
from hmac import compare_digest, new as hmac_new
from secrets import token_bytes, token_urlsafe
from threading import Lock
from typing import Any, Literal
import base64
import json
import logging
import os
import sqlite3
import time

from fastapi import FastAPI, Header, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse
from pydantic import BaseModel, Field, field_validator

APP_NAME = "MARKOVMADE RECODE API"
APP_VERSION = "7.0.0"
TOKEN_ISSUER = "markovmade-recode"
TOKEN_AUDIENCE = "markovmade-recode-cloud"
DEFAULT_SECRET = "development-only-change-before-hosting"
SECRET = os.environ.get("JWT_SECRET", DEFAULT_SECRET)
APP_ENV = os.environ.get("APP_ENV", "development").strip().lower()
CLOUD_AUTH_ENABLED = os.environ.get("CLOUD_AUTH_ENABLED", "0") == "1"
DB_PATH = os.environ.get("SQLITE_PATH", "/data/recode.db")
ACCESS_MINUTES = int(os.environ.get("ACCESS_MINUTES", "20"))
REFRESH_DAYS = int(os.environ.get("REFRESH_DAYS", "30"))
RATE_LIMIT_PER_MINUTE = int(os.environ.get("RATE_LIMIT_PER_MINUTE", "90"))
MAX_BODY_BYTES = int(os.environ.get("MAX_BODY_BYTES", "1048576"))
MAX_RATE_BUCKETS = int(os.environ.get("MAX_RATE_BUCKETS", "10000"))

logger = logging.getLogger("recode.api")
logging.basicConfig(level=os.environ.get("LOG_LEVEL", "INFO"), format="%(message)s")

rate_buckets: dict[str, deque[float]] = defaultdict(deque)
rate_lock = Lock()
metrics_lock = Lock()
metrics: dict[str, int] = defaultdict(int)


def validate_runtime_config() -> None:
    """Refuse unsafe production startup rather than silently using dev defaults."""
    if APP_ENV == "production":
        if SECRET == DEFAULT_SECRET or len(SECRET.encode("utf-8")) < 32:
            raise RuntimeError("production requires JWT_SECRET with at least 32 bytes")
        if not CLOUD_AUTH_ENABLED:
            logger.warning(json.dumps({"event": "cloud_auth_disabled", "environment": APP_ENV}))
    if ACCESS_MINUTES < 1 or REFRESH_DAYS < 1 or RATE_LIMIT_PER_MINUTE < 1:
        raise RuntimeError("token lifetimes and rate limit must be positive")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    validate_runtime_config()
    connection = database()
    connection.execute("SELECT 1").fetchone()
    connection.close()
    yield


app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    docs_url="/docs" if os.environ.get("ENABLE_DOCS") == "1" else None,
    lifespan=lifespan,
)
origins = [item.strip() for item in os.environ.get("CORS_ORIGINS", "").split(",") if item.strip()]
if origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_methods=["GET", "POST", "PUT", "DELETE"],
        allow_headers=["Authorization", "Content-Type"],
        allow_credentials=False,
    )


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def database() -> sqlite3.Connection:
    path = DB_PATH
    if path != ":memory:":
        os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    connection = sqlite3.connect(path, timeout=10, isolation_level=None)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys=ON")
    connection.execute("PRAGMA journal_mode=WAL")
    connection.execute("PRAGMA busy_timeout=10000")
    connection.executescript(
        """
        CREATE TABLE IF NOT EXISTS users(
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS saves(
          user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          schema_version INTEGER NOT NULL,
          revision INTEGER NOT NULL DEFAULT 1,
          payload TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS refresh_tokens(
          token_hash TEXT PRIMARY KEY,
          session_id TEXT NOT NULL DEFAULT '',
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          expires_at TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT '',
          last_used_at TEXT,
          user_agent TEXT NOT NULL DEFAULT '',
          revoked INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id, revoked);
        """
    )
    # Safe forward migration for databases created by 6.0.0.
    existing = {str(row["name"]) for row in connection.execute("PRAGMA table_info(refresh_tokens)")}
    additions = {
        "session_id": "TEXT NOT NULL DEFAULT ''",
        "created_at": "TEXT NOT NULL DEFAULT ''",
        "last_used_at": "TEXT",
        "user_agent": "TEXT NOT NULL DEFAULT ''",
    }
    for column, declaration in additions.items():
        if column not in existing:
            connection.execute(f"ALTER TABLE refresh_tokens ADD COLUMN {column} {declaration}")
    return connection


def b64(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode().rstrip("=")


def b64decode(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def hash_password(password: str) -> str:
    salt = token_bytes(16)
    derived = scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1, dklen=32)
    return f"scrypt$16384$8$1${b64(salt)}${b64(derived)}"


def verify_password(password: str, encoded: str) -> bool:
    try:
        algorithm, n, r, p, salt, expected = encoded.split("$")
        if algorithm != "scrypt":
            return False
        actual = scrypt(password.encode(), salt=b64decode(salt), n=int(n), r=int(r), p=int(p), dklen=32)
        return compare_digest(b64(actual), expected)
    except (ValueError, TypeError):
        return False


def sign_token(user_id: str, kind: Literal["access", "refresh"], lifetime: timedelta, session_id: str) -> str:
    issued = int(datetime.now(timezone.utc).timestamp())
    header = b64(json.dumps({"alg": "HS256", "typ": "JWT"}, separators=(",", ":")).encode())
    payload = b64(json.dumps({
        "iss": TOKEN_ISSUER,
        "aud": TOKEN_AUDIENCE,
        "sub": user_id,
        "type": kind,
        "iat": issued,
        "exp": issued + int(lifetime.total_seconds()),
        "jti": token_urlsafe(18),
        "sid": session_id,
    }, separators=(",", ":")).encode())
    signing_input = f"{header}.{payload}"
    signature = b64(hmac_new(SECRET.encode(), signing_input.encode(), "sha256").digest())
    return f"{signing_input}.{signature}"


def verify_token(raw: str, expected_kind: Literal["access", "refresh"]) -> dict[str, Any]:
    try:
        header, payload, signature = raw.split(".", 2)
        signing_input = f"{header}.{payload}"
        expected = b64(hmac_new(SECRET.encode(), signing_input.encode(), "sha256").digest())
        if not compare_digest(signature, expected):
            raise ValueError("signature")
        header_data = json.loads(b64decode(header))
        data = json.loads(b64decode(payload))
        now = int(datetime.now(timezone.utc).timestamp())
        if header_data != {"alg": "HS256", "typ": "JWT"}:
            raise ValueError("algorithm")
        if data.get("iss") != TOKEN_ISSUER or data.get("aud") != TOKEN_AUDIENCE:
            raise ValueError("issuer_or_audience")
        if data.get("type") != expected_kind or int(data["exp"]) <= now or int(data["iat"]) > now + 60:
            raise ValueError("expired_or_wrong_type")
        if not data.get("sub") or not data.get("jti") or not data.get("sid"):
            raise ValueError("missing_claim")
        return data
    except (ValueError, KeyError, TypeError, json.JSONDecodeError):
        raise HTTPException(401, {"code": "invalid_token", "message": "invalid or expired token"}) from None


def bearer(authorization: str | None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, {"code": "bearer_required", "message": "bearer token required"})
    return authorization[7:]


def current_claims(authorization: str | None) -> dict[str, Any]:
    return verify_token(bearer(authorization), "access")


def current_user(authorization: str | None) -> str:
    return str(current_claims(authorization)["sub"])


def require_cloud_auth() -> None:
    if not CLOUD_AUTH_ENABLED:
        raise HTTPException(503, {"code": "cloud_auth_disabled", "message": "cloud account features are not enabled"})


def issue_pair(user_id: str, connection: sqlite3.Connection, user_agent: str = "", session_id: str | None = None) -> dict[str, Any]:
    session_id = session_id or token_urlsafe(18)
    access = sign_token(user_id, "access", timedelta(minutes=ACCESS_MINUTES), session_id)
    refresh = sign_token(user_id, "refresh", timedelta(days=REFRESH_DAYS), session_id)
    created = now_iso()
    connection.execute(
        "INSERT INTO refresh_tokens(token_hash,session_id,user_id,expires_at,created_at,last_used_at,user_agent,revoked) VALUES(?,?,?,?,?,?,?,0)",
        (sha256(refresh.encode()).hexdigest(), session_id, user_id, (datetime.now(timezone.utc) + timedelta(days=REFRESH_DAYS)).isoformat(), created, created, user_agent[:300]),
    )
    return {
        "access_token": access,
        "refresh_token": refresh,
        "token_type": "bearer",
        "expires_in": ACCESS_MINUTES * 60,
        "session_id": session_id,
    }


@app.middleware("http")
async def security_rate_logging(request: Request, call_next):
    request_id = request.headers.get("x-request-id") or token_urlsafe(10)
    started = time.perf_counter()
    secure_headers = {
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
        "Cache-Control": "no-store",
        "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
        "X-Frame-Options": "DENY",
        "X-Request-ID": request_id,
    }
    content_length = request.headers.get("content-length")
    if content_length:
        try:
            if int(content_length) > MAX_BODY_BYTES:
                return JSONResponse(status_code=413, content={"error": {"code": "payload_too_large", "max_bytes": MAX_BODY_BYTES}}, headers=secure_headers)
        except ValueError:
            return JSONResponse(status_code=400, content={"error": {"code": "invalid_content_length"}}, headers=secure_headers)
    client = request.client.host if request.client else "unknown"
    cutoff = time.monotonic() - 60
    with rate_lock:
        bucket = rate_buckets[client]
        while bucket and bucket[0] < cutoff:
            bucket.popleft()
        if len(bucket) >= RATE_LIMIT_PER_MINUTE:
            return JSONResponse(status_code=429, content={"error": {"code": "rate_limited"}}, headers={**secure_headers, "Retry-After": "60"})
        bucket.append(time.monotonic())
        if len(rate_buckets) > MAX_RATE_BUCKETS:
            stale = [key for key, values in rate_buckets.items() if not values or values[-1] < cutoff]
            for key in stale[: max(1, len(rate_buckets) - MAX_RATE_BUCKETS)]:
                rate_buckets.pop(key, None)
    status = 500
    try:
        response = await call_next(request)
        status = response.status_code
        response.headers.update(secure_headers)
        return response
    finally:
        duration_ms = round((time.perf_counter() - started) * 1000, 2)
        with metrics_lock:
            metrics["http_requests_total"] += 1
            metrics[f"http_status_{status}_total"] += 1
        logger.info(json.dumps({
            "event": "http_request", "request_id": request_id, "method": request.method,
            "path": request.url.path, "status": status, "duration_ms": duration_ms,
        }, separators=(",", ":")))


@app.exception_handler(HTTPException)
async def structured_http_error(_request: Request, error: HTTPException):
    detail = error.detail
    payload = detail if isinstance(detail, dict) else {"code": "request_error", "message": str(detail)}
    return JSONResponse(status_code=error.status_code, content={"error": payload})


class Credentials(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=10, max_length=200)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if normalized.count("@") != 1 or "." not in normalized.rsplit("@", 1)[1]:
            raise ValueError("invalid email")
        return normalized


class RefreshBody(BaseModel):
    refresh_token: str = Field(min_length=40, max_length=4000)


class SaveBody(BaseModel):
    schema_version: int = Field(ge=3, le=100)
    payload: dict[str, Any]
    expected_revision: int | None = Field(default=None, ge=0)


class MentorBody(BaseModel):
    state: Literal["blocked", "tired", "overwhelmed", "returning"] = "blocked"
    minutes_available: int = Field(default=5, ge=1, le=30)


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "version": APP_VERSION,
        "environment": APP_ENV,
        "offline_client_supported": True,
        "cloud_auth_enabled": CLOUD_AUTH_ENABLED,
        "production_secret_configured": SECRET != DEFAULT_SECRET and len(SECRET.encode()) >= 32,
    }


@app.get("/ready")
def ready() -> dict[str, Any]:
    try:
        connection = database(); connection.execute("SELECT 1").fetchone(); connection.close()
    except sqlite3.Error as error:
        raise HTTPException(503, {"code": "database_unavailable", "message": str(error)}) from error
    return {"status": "ready", "version": APP_VERSION, "cloud_auth_enabled": CLOUD_AUTH_ENABLED}


@app.get("/metrics", response_class=PlainTextResponse)
def prometheus_metrics() -> str:
    with metrics_lock:
        snapshot = dict(metrics)
    lines = ["# TYPE recode_http_requests_total counter", f"recode_http_requests_total {snapshot.pop('http_requests_total', 0)}"]
    for key, value in sorted(snapshot.items()):
        lines.append(f"recode_{key} {value}")
    return "\n".join(lines) + "\n"


@app.post("/v1/auth/register", status_code=201)
def register(body: Credentials, request: Request) -> dict[str, Any]:
    require_cloud_auth()
    user_id = token_urlsafe(16)
    connection = database()
    try:
        connection.execute("BEGIN IMMEDIATE")
        connection.execute("INSERT INTO users(id,email,password_hash,created_at) VALUES(?,?,?,?)", (user_id, body.email, hash_password(body.password), now_iso()))
        pair = issue_pair(user_id, connection, request.headers.get("user-agent", ""))
        connection.commit()
        return pair
    except sqlite3.IntegrityError:
        connection.rollback()
        raise HTTPException(409, {"code": "account_exists", "message": "account exists"}) from None
    finally:
        connection.close()


@app.post("/v1/auth/login")
def login(body: Credentials, request: Request) -> dict[str, Any]:
    require_cloud_auth()
    connection = database()
    try:
        row = connection.execute("SELECT id,password_hash FROM users WHERE email=?", (body.email,)).fetchone()
        if not row or not verify_password(body.password, row["password_hash"]):
            raise HTTPException(401, {"code": "invalid_credentials", "message": "invalid credentials"})
        connection.execute("BEGIN IMMEDIATE")
        pair = issue_pair(str(row["id"]), connection, request.headers.get("user-agent", ""))
        connection.commit()
        return pair
    finally:
        connection.close()


@app.post("/v1/auth/refresh")
def refresh(body: RefreshBody, request: Request) -> dict[str, Any]:
    require_cloud_auth()
    data = verify_token(body.refresh_token, "refresh")
    token_hash = sha256(body.refresh_token.encode()).hexdigest()
    connection = database()
    try:
        connection.execute("BEGIN IMMEDIATE")
        row = connection.execute("SELECT user_id,session_id,expires_at,revoked FROM refresh_tokens WHERE token_hash=?", (token_hash,)).fetchone()
        if not row or row["revoked"] or datetime.fromisoformat(row["expires_at"]) < datetime.now(timezone.utc):
            raise HTTPException(401, {"code": "refresh_revoked", "message": "refresh token revoked"})
        if str(row["user_id"]) != str(data["sub"]) or str(row["session_id"]) != str(data["sid"]):
            raise HTTPException(401, {"code": "refresh_mismatch", "message": "refresh token session mismatch"})
        connection.execute("UPDATE refresh_tokens SET revoked=1,last_used_at=? WHERE token_hash=?", (now_iso(), token_hash))
        pair = issue_pair(str(data["sub"]), connection, request.headers.get("user-agent", ""), str(data["sid"]))
        connection.commit()
        return pair
    finally:
        connection.close()


@app.post("/v1/auth/logout")
def logout(body: RefreshBody) -> dict[str, str]:
    token_hash = sha256(body.refresh_token.encode()).hexdigest()
    connection = database()
    try:
        connection.execute("UPDATE refresh_tokens SET revoked=1,last_used_at=? WHERE token_hash=?", (now_iso(), token_hash))
        return {"status": "revoked"}
    finally:
        connection.close()


@app.get("/v1/auth/sessions")
def sessions(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    user_id = current_user(authorization)
    connection = database()
    try:
        rows = connection.execute(
            "SELECT session_id,created_at,last_used_at,user_agent,expires_at FROM refresh_tokens WHERE user_id=? AND revoked=0 AND expires_at>? ORDER BY created_at DESC",
            (user_id, now_iso()),
        ).fetchall()
        unique: dict[str, dict[str, Any]] = {}
        for row in rows:
            unique.setdefault(str(row["session_id"]), dict(row))
        return {"sessions": list(unique.values())}
    finally:
        connection.close()


@app.post("/v1/auth/logout-all")
def logout_all(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    user_id = current_user(authorization)
    connection = database()
    try:
        cursor = connection.execute("UPDATE refresh_tokens SET revoked=1,last_used_at=? WHERE user_id=? AND revoked=0", (now_iso(), user_id))
        return {"status": "revoked", "sessions": cursor.rowcount}
    finally:
        connection.close()


@app.put("/v1/save")
def put_save(body: SaveBody, authorization: str | None = Header(default=None)) -> dict[str, Any]:
    require_cloud_auth()
    user_id = current_user(authorization)
    encoded = json.dumps(body.payload, ensure_ascii=False, separators=(",", ":"))
    if len(encoded.encode("utf-8")) > MAX_BODY_BYTES:
        raise HTTPException(413, {"code": "payload_too_large", "max_bytes": MAX_BODY_BYTES})
    connection = database()
    try:
        connection.execute("BEGIN IMMEDIATE")
        row = connection.execute("SELECT revision FROM saves WHERE user_id=?", (user_id,)).fetchone()
        current_revision = int(row["revision"]) if row else 0
        if body.expected_revision is not None and body.expected_revision != current_revision:
            connection.rollback()
            raise HTTPException(409, {"code": "save_conflict", "server_revision": current_revision})
        revision = current_revision + 1
        updated = now_iso()
        connection.execute(
            """INSERT INTO saves(user_id,schema_version,revision,payload,updated_at) VALUES(?,?,?,?,?)
               ON CONFLICT(user_id) DO UPDATE SET schema_version=excluded.schema_version,revision=excluded.revision,payload=excluded.payload,updated_at=excluded.updated_at""",
            (user_id, body.schema_version, revision, encoded, updated),
        )
        connection.commit()
        return {"status": "saved", "revision": revision, "updated_at": updated}
    finally:
        connection.close()


@app.get("/v1/save")
def get_save(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    require_cloud_auth()
    user_id = current_user(authorization)
    connection = database()
    try:
        row = connection.execute("SELECT schema_version,revision,payload,updated_at FROM saves WHERE user_id=?", (user_id,)).fetchone()
        if not row:
            return {"save": None, "revision": 0, "updated_at": None}
        return {"save": {"schema_version": row["schema_version"], "payload": json.loads(row["payload"])}, "revision": row["revision"], "updated_at": row["updated_at"]}
    finally:
        connection.close()


@app.delete("/v1/data")
def delete_data(authorization: str | None = Header(default=None)) -> dict[str, str]:
    user_id = current_user(authorization)
    connection = database()
    try:
        connection.execute("DELETE FROM users WHERE id=?", (user_id,))
        return {"status": "deleted"}
    finally:
        connection.close()


@app.get("/v1/data/export")
def export_data(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    user_id = current_user(authorization)
    connection = database()
    try:
        row = connection.execute("SELECT schema_version,revision,payload,updated_at FROM saves WHERE user_id=?", (user_id,)).fetchone()
        return {
            "product": "MARKOVMADE: RECODE", "exported_at": now_iso(),
            "save": {"schema_version": row["schema_version"], "revision": row["revision"], "payload": json.loads(row["payload"]), "updated_at": row["updated_at"]} if row else None,
        }
    finally:
        connection.close()


@app.post("/v1/mentor")
def mentor(body: MentorBody, authorization: str | None = Header(default=None)) -> dict[str, Any]:
    current_user(authorization)
    prompts = {
        "blocked": "Назовите одно препятствие и уберите только его.",
        "tired": "Снизьте сложность и защитите ближайшее окно восстановления.",
        "overwhelmed": "Выберите одно действие, которое можно завершить за отведённое время.",
        "returning": "Вернитесь с половины прежнего объёма без попытки наверстать.",
    }
    return {"mode": "deterministic_fallback", "minutes": body.minutes_available, "message": prompts[body.state], "medical_advice": False}
