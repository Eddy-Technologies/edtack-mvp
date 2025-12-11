-- Orders table (replaces user_purchases)
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL, -- Human-readable order number
  user_info_id UUID NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE,
  status_code TEXT NOT NULL,
  total_amount_cents INTEGER NOT NULL, -- Total cost in SGD cents
  currency TEXT, -- Removed default
  payment_method TEXT, -- Removed default
  stripe_balance_transaction_id TEXT, -- Reference to Stripe transaction
  notes TEXT,
  -- Status timestamps for tracking
  pending_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_user_info_id ON orders(user_info_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Grant permissions to service role for webhook processing
GRANT ALL ON orders TO service_role;