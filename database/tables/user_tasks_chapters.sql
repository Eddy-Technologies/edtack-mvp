-- User Tasks Chapters Table
-- Junction table linking user_tasks to chapters for multi-chapter task assignments
-- This allows parents to assign tasks covering multiple chapters within a subject
CREATE TABLE IF NOT EXISTS user_tasks_chapters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_task_id UUID NOT NULL REFERENCES user_tasks(id) ON DELETE CASCADE,
  chapter_name VARCHAR(100) NOT NULL REFERENCES chapters(name) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure no duplicate chapter assignments per task
  CONSTRAINT unique_task_chapter UNIQUE(user_task_id, chapter_name)
);

-- Performance indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_user_tasks_chapters_task ON user_tasks_chapters(user_task_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_chapters_chapter ON user_tasks_chapters(chapter_name);

-- Composite index for querying task chapters together
CREATE INDEX IF NOT EXISTS idx_user_tasks_chapters_task_chapter ON user_tasks_chapters(user_task_id, chapter_name);