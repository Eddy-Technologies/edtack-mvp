-- Database Migrations for Internal Credit System
-- Run these commands in your Supabase SQL Editor

-- 1. Create user_credits table for internal credit tracking
CREATE TABLE IF NOT EXISTS user_credits (
  user_info_id UUID NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE,
  credit INTEGER NOT NULL DEFAULT 0, -- Credit balance in cents
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_info_id)
);

-- Add indexes for user_credits
CREATE INDEX IF NOT EXISTS idx_user_credits_user_info_id ON user_credits(user_info_id);

-- 2. Create task_credit table for task-based credit earning
CREATE TABLE IF NOT EXISTS task_credit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_user_info_id UUID NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE,
  child_user_info_id UUID NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  credit INTEGER NOT NULL DEFAULT 0, -- Credit reward in cents
  status TEXT NOT NULL DEFAULT 'pending', 
  -- Status options: pending, in_progress, completed, approved, rejected, cancelled, expired
  due_date TIMESTAMPTZ,
  priority TEXT DEFAULT 'medium', -- low, medium, high
  category TEXT, -- chores, homework, behavior, etc.
  completion_notes TEXT, -- Notes from child when completing task
  approval_notes TEXT, -- Notes from parent when approving/rejecting
  completed_at TIMESTAMPTZ, -- When child marked as completed
  approved_at TIMESTAMPTZ, -- When parent approved/rejected
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for task_credit
CREATE INDEX IF NOT EXISTS idx_task_credit_parent ON task_credit(parent_user_info_id);
CREATE INDEX IF NOT EXISTS idx_task_credit_child ON task_credit(child_user_info_id);

-- Add constraint to ensure parent and child are different
ALTER TABLE task_credit ADD CONSTRAINT chk_different_users 
  CHECK (parent_user_info_id != child_user_info_id);

-- Add constraint for valid status values
ALTER TABLE task_credit ADD CONSTRAINT chk_valid_status 
  CHECK (status IN ('pending', 'in_progress', 'completed', 'approved', 'rejected', 'cancelled', 'expired'));

-- 7. Create initial user_credits records for existing users
-- This will create a record with 0 credits for all existing users
INSERT INTO user_credits (user_info_id, credit)
SELECT id, 0 
FROM user_infos 
WHERE id NOT IN (SELECT user_info_id FROM user_credits);

