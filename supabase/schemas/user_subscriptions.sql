-- User Subscriptions Table (Local Stripe sync to avoid API latency)
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_info_id UUID NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) NOT NULL UNIQUE,
  stripe_customer_id VARCHAR(255) NOT NULL,
  tier_lookup_key VARCHAR(50) NOT NULL REFERENCES subscription_tier_limits(tier_lookup_key),
  status VARCHAR(50) NOT NULL, -- active, canceled, past_due, trialing, etc.
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  billing_interval VARCHAR(10) NOT NULL, -- 'month' or 'year'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX idx_user_subscriptions_user_info_id ON user_subscriptions(user_info_id);
CREATE INDEX idx_user_subscriptions_stripe_sub_id ON user_subscriptions(stripe_subscription_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
