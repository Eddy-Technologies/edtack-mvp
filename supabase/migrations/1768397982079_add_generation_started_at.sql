-- Add generation_started_at column to user_tasks_chapters
-- This column tracks when quiz generation began for a task-chapter

-- Add the column
ALTER TABLE user_tasks_chapters
ADD COLUMN IF NOT EXISTS generation_started_at TIMESTAMPTZ;

-- Update the status CHECK constraint to include 'GENERATING'
ALTER TABLE user_tasks_chapters
DROP CONSTRAINT IF EXISTS chk_user_tasks_chapters_status;

ALTER TABLE user_tasks_chapters
ADD CONSTRAINT chk_user_tasks_chapters_status
CHECK (status IN ('OPEN', 'COMPLETED', 'EXPIRED', 'GENERATING'));
