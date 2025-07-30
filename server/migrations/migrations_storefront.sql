-- Database Migrations for Storefront Products and Purchases (Updated)
-- Run these commands in your Supabase SQL Editor AFTER running migrations_webhook_credits.sql
-- This version removes the user_product_access feature as it's not needed

-- 1. Drop user_product_access table if it exists (cleanup)
DROP TABLE IF EXISTS user_product_access CASCADE;

-- 2. Create products table for storefront product catalog
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_product_id TEXT UNIQUE, -- Reference to Stripe product
  stripe_price_id TEXT, -- Reference to Stripe price
  name TEXT NOT NULL,
  description TEXT,
  product_type TEXT NOT NULL CHECK (product_type IN ('digital_content', 'credits', 'subscription', 'course', 'assessment')),
  price_cents INTEGER NOT NULL, -- Price in cents
  currency TEXT DEFAULT 'SGD',
  digital_content_url TEXT, -- For digital downloads
  credit_amount INTEGER, -- For credit products
  category TEXT,
  prerequisites TEXT[], -- Array of required product IDs or conditions
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB, -- Additional product data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_products_stripe_product_id ON products(stripe_product_id);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- 3. Create user_purchases table for storefront purchase records (simplified)
CREATE TABLE IF NOT EXISTS user_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_info_id UUID NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  purchase_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN (
    'paid', 'processing', 'shipped', 'in_transit', 'delivered', 
    'returned', 'failed_to_deliver', 'refund_requested', 
    'refund_in_progress', 'refunded', 'cancel_requested', 
    'cancel_in_progress', 'cancelled'
  )),
  quantity INTEGER DEFAULT 1,
  total_amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'SGD',
  metadata JSONB, -- Purchase data including items array
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for user_purchases
CREATE INDEX IF NOT EXISTS idx_user_purchases_user_info_id ON user_purchases(user_info_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_status ON user_purchases(status);
CREATE INDEX IF NOT EXISTS idx_user_purchases_stripe_payment_intent ON user_purchases(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_purchase_date ON user_purchases(purchase_date DESC);

-- 4. Add balance_transactions table improvements (if not already added)
-- Add stripe_transaction_id column to balance_transactions for better integration
ALTER TABLE balance_transactions 
ADD COLUMN IF NOT EXISTS stripe_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS related_order_id UUID REFERENCES user_purchases(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_balance_transactions_stripe_transaction_id ON balance_transactions(stripe_transaction_id);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_related_order_id ON balance_transactions(related_order_id);

-- Add triggers to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to tables that have updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_purchases_updated_at BEFORE UPDATE ON user_purchases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) on new tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Products: Everyone can view active products
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (is_active = TRUE);

-- User purchases: Users can view their own purchases
CREATE POLICY "Users can view own purchases" ON user_purchases
  FOR SELECT USING (user_info_id IN (
    SELECT id FROM user_infos WHERE user_id = auth.uid()
  ));

-- Grant permissions to service role for webhook processing
GRANT ALL ON products TO service_role;
GRANT ALL ON user_purchases TO service_role;

-- Comments for documentation
COMMENT ON TABLE products IS 'Product catalog for storefront items';
COMMENT ON TABLE user_purchases IS 'Purchase records for storefront transactions - no access control needed, purchases are for physical/virtual goods';
COMMENT ON COLUMN user_purchases.metadata IS 'Contains items array with product details, checkout info, and payment method';
COMMENT ON COLUMN user_purchases.status IS 'Order fulfillment status using ORDER_STATUS constants';