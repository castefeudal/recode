PRAGMA foreign_keys=ON;
ALTER TABLE refresh_tokens ADD COLUMN session_id TEXT NOT NULL DEFAULT '';
ALTER TABLE refresh_tokens ADD COLUMN created_at TEXT NOT NULL DEFAULT '';
ALTER TABLE refresh_tokens ADD COLUMN last_used_at TEXT;
ALTER TABLE refresh_tokens ADD COLUMN user_agent TEXT NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id, revoked);
