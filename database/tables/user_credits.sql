-- User Credits table for internal credit tracking
CREATE TABLE IF NOT EXISTS user_credits (
  user_info_id UUID NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE,
  credit INTEGER NOT NULL DEFAULT 0, -- Credit balance in cents
  reserved_credit INTEGER DEFAULT 0, -- Credits reserved for pending orders
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_info_id)
);

-- Add constraint to ensure reserved credits don't exceed total credits
ALTER TABLE user_credits 
ADD CONSTRAINT chk_reserved_not_exceed_total 
CHECK (reserved_credit <= credit);

-- Add indexes for user_credits
CREATE INDEX IF NOT EXISTS idx_user_credits_user_info_id ON user_credits(user_info_id);