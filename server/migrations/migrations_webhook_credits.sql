-- Database Migrations for Stripe Webhook Support and Credit Transactions
-- Run these commands in your Supabase SQL Editor

-- 1. Create stripe_webhook_events table for idempotency
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

-- 2. Create credit_transactions table for credit operations
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_info_id UUID NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'transfer_in', 'transfer_out', 'usage', 'refund')),
  amount INTEGER NOT NULL, -- Credits amount (can be negative for usage/transfers out)
  stripe_payment_intent_id TEXT, -- For purchases from Stripe
  stripe_checkout_session_id TEXT, -- For checkout sessions
  from_user_info_id UUID REFERENCES user_infos(id), -- For transfers
  to_user_info_id UUID REFERENCES user_infos(id), -- For transfers
  description TEXT,
  metadata JSONB, -- Additional transaction data
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_info_id ON credit_transactions(user_info_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_stripe_payment_intent ON credit_transactions(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);

-- Enable Row Level Security (RLS) on new tables
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Webhook events: Only accessible by service role
CREATE POLICY "Service role can manage webhook events" ON stripe_webhook_events
  FOR ALL USING (auth.role() = 'service_role');

-- Credit transactions: Users can view their own transactions
CREATE POLICY "Users can view own credit transactions" ON credit_transactions
  FOR SELECT USING (user_info_id IN (
    SELECT id FROM user_infos WHERE user_id = auth.uid()
  ));

-- Grant permissions to service role for webhook processing
GRANT ALL ON stripe_webhook_events TO service_role;
GRANT ALL ON credit_transactions TO service_role;