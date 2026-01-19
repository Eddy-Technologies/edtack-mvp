-- Add ATTEMPTED status to user_tasks_chapters
-- This distinguishes between chapters that have been attempted but not passed
-- vs chapters that have been completed successfully (score >= required_score)

ALTER TABLE user_tasks_chapters
  DROP CONSTRAINT IF EXISTS chk_user_tasks_chapters_status;

ALTER TABLE user_tasks_chapters
  ADD CONSTRAINT chk_user_tasks_chapters_status
  CHECK (status IN ('OPEN', 'COMPLETED', 'EXPIRED', 'GENERATING', 'ATTEMPTED'));

-- Add generation_started_at column for fail-safe timeout tracking
ALTER TABLE user_tasks_chapters
ADD COLUMN IF NOT EXISTS generation_started_at TIMESTAMPTZ DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN user_tasks_chapters.generation_started_at IS 'Timestamp when quiz generation started. Used by cron to reset stuck GENERATING chapters.';
