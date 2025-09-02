-- User Tasks table for task-based credit earning
CREATE TABLE IF NOT EXISTS user_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_user_info_id UUID NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE,
  assignee_user_info_id UUID NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  lesson_generation_type TEXT NOT NULL,
  credit INTEGER NOT NULL DEFAULT 0, -- Credit reward in cents
  questions_per_quiz INTEGER DEFAULT 10, -- Number of questions per quiz (for quiz tasks)
  required_score INTEGER DEFAULT 70, -- Required score percentage (0-100) to earn credit
  recurrence_frequency TEXT, -- ONE_OFF, DAILY, WEEKLY, MONTHLY - controls task scheduling
  due_date TIMESTAMPTZ,
  status TEXT NOT NULL, 
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for user_tasks
CREATE INDEX IF NOT EXISTS idx_user_tasks_creator ON user_tasks(creator_user_info_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_assignee ON user_tasks(assignee_user_info_id);

-- Add constraint to ensure creator and assignee are different
ALTER TABLE user_tasks ADD CONSTRAINT chk_different_users 
  CHECK (creator_user_info_id != assignee_user_info_id);