-- Reset Stuck GENERATING Chapters Cron Job
-- Runs every 5 minutes to reset chapters stuck in GENERATING state

-- Enable pg_cron extension (safe to run multiple times)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant permissions on cron schema and tables
GRANT USAGE ON SCHEMA cron TO postgres;

-- Remove existing job if it exists (idempotent)
DO $$
BEGIN
  PERFORM cron.unschedule('reset-stuck-generating-chapters');
EXCEPTION WHEN undefined_table THEN
  -- cron.job table doesn't exist yet, ignore
WHEN OTHERS THEN
  -- Job doesn't exist or other error, ignore
END $$;

-- Schedule the job to run every 5 minutes
SELECT cron.schedule(
  'reset-stuck-generating-chapters',
  '*/5 * * * *',
  'SELECT reset_stuck_generating_chapters()'
);
