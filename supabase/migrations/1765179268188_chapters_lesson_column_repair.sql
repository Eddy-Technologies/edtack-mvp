-- Repair migration: ensure lesson column exists on chapters table
-- This is safe to run multiple times due to IF NOT EXISTS
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS lesson TEXT DEFAULT NULL;
