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
  
  -- Foreign key to the parent task definition
  -- ON DELETE CASCADE ensures threads are cleaned up when parent task is deleted
  user_task_id UUID NOT NULL REFERENCES user_tasks(id) ON DELETE CASCADE,
  
  -- Optional reference to chat thread for content generation and interaction
  -- ON DELETE SET NULL preserves task_thread even if chat is deleted
  chat_thread_id UUID REFERENCES chat_threads(id) ON DELETE SET NULL,
  
  -- Due date for this specific task instance
  -- Essential for recurring tasks where each instance has its own deadline
  due_date TIMESTAMPTZ NOT NULL,
  
  -- Initial prompt sent to content generation system
  -- Stored as JSONB to match websocket input format and enable flexible querying
  -- Example: {"subject": "math", "difficulty": "grade_5", "questions": 10}
  init_prompt JSONB,
  
  -- Generated content from AI/content generation system
  -- Stored as JSONB for flexibility (could be quiz questions, lesson content, etc.)
  -- Example: {"questions": [...], "answers": [...], "metadata": {...}}
  generated_content JSONB,
  
  -- Status of this specific task thread instance
  -- 'open' - Task thread is active and pending completion
  -- 'completed' - Student has completed this task thread
  -- 'expired' - Task thread passed due date without completion
  status TEXT NOT NULL DEFAULT 'open',
  
  -- Timestamp tracking
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_task_threads_user_task ON task_threads(user_task_id);
CREATE INDEX IF NOT EXISTS idx_task_threads_chat_thread ON task_threads(chat_thread_id);
CREATE INDEX IF NOT EXISTS idx_task_threads_status ON task_threads(status);
CREATE INDEX IF NOT EXISTS idx_task_threads_due_date ON task_threads(due_date);

-- Composite index for recurring task cron job queries
-- Optimizes finding threads that need status updates or new instances created
CREATE INDEX IF NOT EXISTS idx_task_threads_status_due_date ON task_threads(status, due_date);

-- Add constraint to ensure valid status values
ALTER TABLE task_threads 
ADD CONSTRAINT chk_task_threads_status 
CHECK (status IN ('OPEN', 'COMPLETED', 'EXPIRED'));

-- Add constraint to ensure due_date is not in the past when creating
-- (This will be enforced at the application level for flexibility)