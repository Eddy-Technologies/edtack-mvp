-- User Tasks Chapters Questions Junction Table
-- Links specific questions to each task-chapter combination
-- This enables custom question selection per task assignment, allowing different
-- students to have different question sets for the same chapter

CREATE TABLE IF NOT EXISTS user_tasks_chapters_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_tasks_chapters_id UUID NOT NULL REFERENCES user_tasks_chapters(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure each question appears only once per task-chapter combination
  CONSTRAINT unique_task_chapter_question UNIQUE(user_tasks_chapters_id, question_id)
);

-- Performance indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_utcq_task_chapter
  ON user_tasks_chapters_questions(user_tasks_chapters_id);

CREATE INDEX IF NOT EXISTS idx_utcq_question
  ON user_tasks_chapters_questions(question_id);

CREATE INDEX IF NOT EXISTS idx_utcq_display_order
  ON user_tasks_chapters_questions(user_tasks_chapters_id, display_order);
