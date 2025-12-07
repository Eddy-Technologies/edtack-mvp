-- Token Rollup Cron Job
-- Runs every 10 minutes to aggregate token usage

-- Enable pg_cron extension (safe to run multiple times)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant permissions on cron schema and tables
GRANT USAGE ON SCHEMA cron TO postgres;

-- Remove existing job if it exists (idempotent)
DO $$
BEGIN
  PERFORM cron.unschedule('token-rollup-job');
EXCEPTION WHEN undefined_table THEN
  -- cron.job table doesn't exist yet, ignore
WHEN OTHERS THEN
  -- Job doesn't exist or other error, ignore
END $$;

-- Schedule the job
SELECT cron.schedule(
  'token-rollup-job',
  '*/1 * * * *',
  'SELECT * FROM rollup_token_usage()'
);
