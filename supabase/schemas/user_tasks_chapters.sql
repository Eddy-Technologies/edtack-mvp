-- User Tasks Chapters Table
-- Junction table linking user_tasks to chapters for multi-chapter task assignments
-- This allows parents to assign tasks covering multiple chapters within a subject
-- ENHANCED: Now includes status tracking and completion data for each chapter within a task
CREATE TABLE IF NOT EXISTS user_tasks_chapters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_task_id UUID NOT NULL REFERENCES user_tasks(id) ON DELETE CASCADE,
  chapter_name VARCHAR(100) NOT NULL REFERENCES chapters(name) ON DELETE CASCADE,

  -- Status tracking fields
  status TEXT DEFAULT 'OPEN' NOT NULL,
  score INTEGER,
  total_score INTEGER,
  completed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure no duplicate chapter assignments per task
  CONSTRAINT unique_task_chapter UNIQUE(user_task_id, chapter_name),

  -- Ensure valid status values
  CONSTRAINT chk_user_tasks_chapters_status CHECK (status IN ('OPEN', 'COMPLETED', 'EXPIRED'))
);

-- Performance indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_user_tasks_chapters_task ON user_tasks_chapters(user_task_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_chapters_chapter ON user_tasks_chapters(chapter_name);
CREATE INDEX IF NOT EXISTS idx_user_tasks_chapters_status ON user_tasks_chapters(status);
CREATE INDEX IF NOT EXISTS idx_user_tasks_chapters_completed_at ON user_tasks_chapters(completed_at);

-- Composite index for querying task chapters together
CREATE INDEX IF NOT EXISTS idx_user_tasks_chapters_task_chapter ON user_tasks_chapters(user_task_id, chapter_name);

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_tasks_chapters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_tasks_chapters_updated_at
  BEFORE UPDATE ON user_tasks_chapters
  FOR EACH ROW
  EXECUTE FUNCTION update_user_tasks_chapters_updated_at();