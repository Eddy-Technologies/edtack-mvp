-- Reset Stuck GENERATING Chapters Function
-- Resets chapters stuck in GENERATING status for more than 10 minutes

CREATE OR REPLACE FUNCTION reset_stuck_generating_chapters()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_count INTEGER;
BEGIN
  UPDATE user_tasks_chapters
  SET
    status = 'OPEN',
    generation_started_at = NULL
  WHERE
    status = 'GENERATING'
    AND generation_started_at IS NOT NULL
    AND generation_started_at < NOW() - INTERVAL '10 minutes';

  GET DIAGNOSTICS affected_count = ROW_COUNT;

  IF affected_count > 0 THEN
    RAISE LOG 'Reset % stuck GENERATING chapters', affected_count;
  END IF;

  RETURN affected_count;
END;
$$;
