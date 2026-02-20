-- Update CHECK constraint to include GENERATING status for user_tasks_chapters
-- This allows the quiz generation process to mark chapters as GENERATING during quiz creation

ALTER TABLE user_tasks_chapters
  DROP CONSTRAINT IF EXISTS chk_user_tasks_chapters_status;

ALTER TABLE user_tasks_chapters
  ADD CONSTRAINT chk_user_tasks_chapters_status
  CHECK (status IN ('OPEN', 'COMPLETED', 'EXPIRED', 'GENERATING', 'ATTEMPTED'));
