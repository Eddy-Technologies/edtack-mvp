-- User Tasks table for task-based credit earning
CREATE TABLE IF NOT EXISTS user_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_user_info_id UUID NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE,
  assignee_user_info_id UUID NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT,
  lesson_generation_type TEXT,
  subtitle TEXT, -- TODO: can remove if not needed
  description TEXT, -- TODO: can remove if not needed
  credit INTEGER NOT NULL DEFAULT 0, -- Credit reward in cents
  status TEXT NOT NULL, 
  due_date TIMESTAMPTZ,
  priority TEXT,
  category TEXT, -- TODO: can remove if not needed
  completion_notes TEXT, -- Notes from assignee when completing task
  approval_notes TEXT, -- Notes from creator when approving/rejecting
  completed_at TIMESTAMPTZ, -- When assignee marked as completed
  approved_at TIMESTAMPTZ, -- When creator approved/rejected
  auto_approve BOOLEAN DEFAULT FALSE, -- If true, task is auto-approved on completion
  -- Recurring task fields
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_frequency TEXT, -- daily, weekly, monthly
  recurrence_interval INTEGER DEFAULT 1, -- every X days/weeks/months
  recurrence_end_date TIMESTAMPTZ,
  parent_task_id UUID REFERENCES user_tasks(id) ON DELETE CASCADE, -- Links recurring instances to parent
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for user_tasks
CREATE INDEX IF NOT EXISTS idx_user_tasks_creator ON user_tasks(creator_user_info_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_assignee ON user_tasks(assignee_user_info_id);

-- Add constraint to ensure creator and assignee are different
ALTER TABLE user_tasks ADD CONSTRAINT chk_different_users 
  CHECK (creator_user_info_id != assignee_user_info_id);