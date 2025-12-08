-- Token Rollup Function
-- Aggregates tokens from token_history into token_usage_summary incrementally

CREATE OR REPLACE FUNCTION rollup_token_usage()
RETURNS TABLE(processed INT, errors INT)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  sub RECORD;
  v_last_id INTEGER;
  v_new_total BIGINT;
  v_new_input BIGINT;
  v_new_output BIGINT;
  v_max_id INTEGER;
  v_processed INT := 0;
  v_errors INT := 0;
BEGIN
  FOR sub IN
    SELECT user_info_id, current_period_start, current_period_end
    FROM user_subscriptions
    WHERE status = 'active'
  LOOP
    BEGIN
      -- Get last processed ID
      SELECT COALESCE(last_token_history_id, 0) INTO v_last_id
      FROM token_usage_summary
      WHERE user_info_id = sub.user_info_id
        AND period_start = sub.current_period_start
        AND period_end = sub.current_period_end;

      IF NOT FOUND THEN
        v_last_id := 0;
      END IF;

      -- Aggregate new records
      SELECT
        COALESCE(SUM(token_count), 0),
        COALESCE(SUM(input_tokens), 0),
        COALESCE(SUM(output_tokens), 0),
        COALESCE(MAX(id), v_last_id)
      INTO v_new_total, v_new_input, v_new_output, v_max_id
      FROM token_history
      WHERE user_infos_id = sub.user_info_id
        AND query_at >= sub.current_period_start
        AND query_at < sub.current_period_end
        AND id > v_last_id;

      -- Skip if no new records
      CONTINUE WHEN v_max_id = v_last_id;

      -- Upsert with simple increment
      INSERT INTO token_usage_summary (
        user_info_id, period_start, period_end,
        total_tokens, input_tokens, output_tokens,
        last_aggregated_at, last_token_history_id
      ) VALUES (
        sub.user_info_id, sub.current_period_start, sub.current_period_end,
        v_new_total, v_new_input, v_new_output,
        NOW(), v_max_id
      )
      ON CONFLICT (user_info_id, period_start, period_end) DO UPDATE SET
        total_tokens = token_usage_summary.total_tokens + EXCLUDED.total_tokens,
        input_tokens = token_usage_summary.input_tokens + EXCLUDED.input_tokens,
        output_tokens = token_usage_summary.output_tokens + EXCLUDED.output_tokens,
        last_aggregated_at = NOW(),
        last_token_history_id = EXCLUDED.last_token_history_id,
        updated_at = NOW();

      v_processed := v_processed + 1;
    EXCEPTION WHEN OTHERS THEN
      v_errors := v_errors + 1;
      RAISE WARNING 'Error processing user %: %', sub.user_info_id, SQLERRM;
    END;
  END LOOP;

  RETURN QUERY SELECT v_processed, v_errors;
END;
$$;
