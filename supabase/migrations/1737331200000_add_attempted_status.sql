-- Add ATTEMPTED status to user_tasks_chapters
-- This distinguishes between chapters that have been attempted but not passed
-- vs chapters that have been completed successfully (score >= required_score)
--
-- NOTE: This migration was created with an early timestamp and runs before the
-- user_tasks_chapters table is created. The changes are now incorporated into
-- 1765179262188_user_tasks_chapters.sql and 1768600000000_add_generating_status.sql.
-- This block is kept for remote DB compatibility (already applied there).

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_tasks_chapters'
  ) THEN
    ALTER TABLE user_tasks_chapters
      DROP CONSTRAINT IF EXISTS chk_user_tasks_chapters_status;

    ALTER TABLE user_tasks_chapters
      ADD CONSTRAINT chk_user_tasks_chapters_status
      CHECK (status IN ('OPEN', 'COMPLETED', 'EXPIRED', 'GENERATING', 'ATTEMPTED'));

    ALTER TABLE user_tasks_chapters
      ADD COLUMN IF NOT EXISTS generation_started_at TIMESTAMPTZ DEFAULT NULL;

    COMMENT ON COLUMN user_tasks_chapters.generation_started_at IS
      'Timestamp when quiz generation started. Used by cron to reset stuck GENERATING chapters.';
  END IF;
END
$$;
