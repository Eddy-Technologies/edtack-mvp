-- User Tasks table for task-based credit earning
CREATE TABLE IF NOT EXISTS user_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_user_info_id UUID NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE,
  assignee_user_info_id UUID NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  credit INTEGER NOT NULL DEFAULT 0, -- Credit reward in cents
  status TEXT NOT NULL DEFAULT 'pending', 
  -- Status options: pending, in_progress, completed, approved, rejected, cancelled, expired
  due_date TIMESTAMPTZ,
  priority TEXT DEFAULT 'medium', -- low, medium, high
  category TEXT, -- chores, homework, behavior, etc.
  completion_notes TEXT, -- Notes from assignee when completing task
  approval_notes TEXT, -- Notes from creator when approving/rejecting
  completed_at TIMESTAMPTZ, -- When assignee marked as completed
  approved_at TIMESTAMPTZ, -- When creator approved/rejected
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for user_tasks
CREATE INDEX IF NOT EXISTS idx_user_tasks_creator ON user_tasks(creator_user_info_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_assignee ON user_tasks(assignee_user_info_id);

-- Add constraint to ensure creator and assignee are different
ALTER TABLE user_tasks ADD CONSTRAINT chk_different_users 
  CHECK (creator_user_info_id != assignee_user_info_id);

-- Add constraint for valid status values
ALTER TABLE user_tasks ADD CONSTRAINT chk_valid_status 
  CHECK (status IN ('pending', 'in_progress', 'completed', 'approved', 'rejected', 'cancelled', 'expired'));