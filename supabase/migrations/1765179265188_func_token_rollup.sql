-- Token Rollup Function
-- Aggregates tokens from token_history into token_usage_summary incrementally
-- Links token_history to user_infos via threads table when user_infos_id is NULL
-- Optimized: Single query processes all users at once instead of N queries for N users

CREATE OR REPLACE FUNCTION rollup_token_usage()
RETURNS TABLE(processed INT, errors INT)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_global_last_id INTEGER;
  v_new_max_id INTEGER;
  v_processed INT := 0;
BEGIN
  -- Get global last processed ID
  SELECT COALESCE(MAX(last_token_history_id), 0)
  INTO v_global_last_id
  FROM token_usage_summary;

  -- Get max ID we'll process
  SELECT COALESCE(MAX(id), v_global_last_id)
  INTO v_new_max_id
  FROM token_history
  WHERE id > v_global_last_id;

  -- Skip if nothing new
  IF v_new_max_id = v_global_last_id THEN
    RETURN QUERY SELECT 0, 0;
    RETURN;
  END IF;

  -- Single query: aggregate ALL users at once
  INSERT INTO token_usage_summary (
    user_info_id, period_start, period_end,
    total_tokens, input_tokens, output_tokens,
    last_aggregated_at, last_token_history_id
  )
  SELECT
    COALESCE(th.user_infos_id, t.user_infos_id),
    us.current_period_start,
    us.current_period_end,
    SUM(th.token_count),
    SUM(th.input_tokens),
    SUM(th.output_tokens),
    NOW(),
    MAX(th.id)
  FROM token_history th
  LEFT JOIN threads t ON th.thread_id = t.id::text
  JOIN user_subscriptions us
    ON COALESCE(th.user_infos_id, t.user_infos_id) = us.user_info_id
    AND us.status = 'active'
    AND th.query_at >= us.current_period_start
    AND th.query_at < us.current_period_end
  WHERE th.id > v_global_last_id
  GROUP BY
    COALESCE(th.user_infos_id, t.user_infos_id),
    us.current_period_start,
    us.current_period_end
  ON CONFLICT (user_info_id, period_start, period_end) DO UPDATE SET
    total_tokens = token_usage_summary.total_tokens + EXCLUDED.total_tokens,
    input_tokens = token_usage_summary.input_tokens + EXCLUDED.input_tokens,
    output_tokens = token_usage_summary.output_tokens + EXCLUDED.output_tokens,
    last_aggregated_at = NOW(),
    last_token_history_id = GREATEST(token_usage_summary.last_token_history_id, EXCLUDED.last_token_history_id),
    updated_at = NOW();

  GET DIAGNOSTICS v_processed = ROW_COUNT;
  RETURN QUERY SELECT v_processed, 0;
END;
$$;
