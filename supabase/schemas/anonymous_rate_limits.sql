-- Anonymous Rate Limits Table
-- Tracks daily message counts for anonymous users (identified by session_id)

CREATE TABLE anonymous_rate_limits (
  session_id VARCHAR(36) PRIMARY KEY,
  message_count_daily INT DEFAULT 0,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  daily_reset_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for cleanup queries
CREATE INDEX idx_anonymous_rate_limits_daily_reset ON anonymous_rate_limits(daily_reset_at);
