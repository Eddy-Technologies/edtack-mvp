-- Token Usage Summary Table (Pre-aggregated for fast queries)
CREATE TABLE token_usage_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_info_id UUID NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  total_tokens BIGINT NOT NULL DEFAULT 0,
  input_tokens BIGINT NOT NULL DEFAULT 0,
  output_tokens BIGINT NOT NULL DEFAULT 0,
  last_aggregated_at TIMESTAMPTZ NOT NULL,
  last_token_history_id INTEGER, -- Track last processed record for incremental rollup
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_info_id, period_start, period_end)
);

-- Index for fast period lookups
CREATE INDEX idx_token_usage_summary_user_period ON token_usage_summary(user_info_id, period_start, period_end);
