-- Subscription Tier Limits Table (Configurable token limits per tier)
CREATE TABLE subscription_tier_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_lookup_key VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  token_limit_monthly BIGINT NOT NULL DEFAULT 0, -- 0 = unlimited
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX idx_subscription_tier_limits_lookup_key ON subscription_tier_limits(tier_lookup_key);
CREATE INDEX idx_subscription_tier_limits_active ON subscription_tier_limits(is_active);
