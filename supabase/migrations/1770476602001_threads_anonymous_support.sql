-- Add anonymous user support to threads table

-- Make user_infos_id nullable for anonymous users
ALTER TABLE threads ALTER COLUMN user_infos_id DROP NOT NULL;

-- Add is_anonymous flag
ALTER TABLE threads ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE;

-- Add session ID for anonymous users
ALTER TABLE threads ADD COLUMN IF NOT EXISTS anon_session_id VARCHAR(36);

-- Index for querying anonymous user threads
CREATE INDEX IF NOT EXISTS idx_threads_anon_session_id ON threads(anon_session_id) WHERE anon_session_id IS NOT NULL;
