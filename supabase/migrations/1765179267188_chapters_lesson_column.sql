-- Add lesson column to chapters table for seeded lesson content
-- Stores JSON array of slides; null means use AI generation
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS lesson TEXT DEFAULT NULL;
