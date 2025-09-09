-- Task Threads table for tracking individual task instances
-- This table implements a 1:many relationship with user_tasks, where:
-- - user_tasks acts as a template/definition for recurring tasks
-- - task_threads represents individual instances that users actually work on
-- 
-- This design enables:
-- 1. Proper tracking of recurring task instances with individual due dates
-- 2. Separation of task definition (user_tasks) from execution (task_threads)  
-- 3. Integration with chat system for content generation and interaction
-- 4. Granular status tracking for each task instance

CREATE TABLE IF NOT EXISTS task_threads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_task_id UUID NOT NULL REFERENCES user_tasks(id) ON DELETE CASCADE,
  thread_id UUID UNIQUE NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  chapter VARCHAR(100) NOT NULL REFERENCES chapters(name) ON DELETE CASCADE,
  due_date TIMESTAMPTZ NOT NULL,
  init_prompt JSONB,   -- Example: {"subject": "math", "difficulty": "grade_5", "questions": 10}
  generated_content JSONB,   -- TODO: currently not in use, will be generated from the thread on init
  status TEXT NOT NULL DEFAULT 'OPEN', -- OPEN, COMPLETED, EXPIRED
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_task_threads_user_task ON task_threads(user_task_id);
CREATE INDEX IF NOT EXISTS idx_task_threads_thread ON task_threads(thread_id);
CREATE INDEX IF NOT EXISTS idx_task_threads_status ON task_threads(status);

-- Composite index for recurring task cron job queries
-- Optimizes finding threads that need status updates or new instances created
CREATE INDEX IF NOT EXISTS idx_task_threads_status_due_date ON task_threads(status, due_date);

-- Add constraint to ensure valid status values
ALTER TABLE task_threads 
ADD CONSTRAINT chk_task_threads_status 
CHECK (status IN ('OPEN', 'COMPLETED', 'EXPIRED'));

-- Add constraint to ensure due_date is not in the past when creating
-- (This will be enforced at the application level for flexibility)