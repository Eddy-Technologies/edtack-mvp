-- Credit Reservation System for Task Assignments
-- Reserve credits when task is created, release to student on completion, return to parent on closure
-- Uses existing reserved_credit column in user_credits for both students (orders) and parents (tasks)

-- Add credits_disbursed to track paid out credits per task
ALTER TABLE user_tasks
ADD COLUMN IF NOT EXISTS credits_disbursed INTEGER DEFAULT 0;
