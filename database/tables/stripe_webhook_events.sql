-- Stripe Webhook Events table for idempotency
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_stripe_event_id ON stripe_webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_processed ON stripe_webhook_events(processed);

-- Enable Row Level Security (RLS) on new tables
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- Webhook events: Only accessible by service role
CREATE POLICY "Service role can manage webhook events" ON stripe_webhook_events
  FOR ALL USING (auth.role() = 'service_role');

-- Grant permissions to service role for webhook processing
GRANT ALL ON stripe_webhook_events TO service_role;