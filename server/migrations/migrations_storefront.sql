-- Database Migrations for Storefront Products and Orders
-- Run these commands in your Supabase SQL Editor AFTER running:
-- 1. migrations_webhook_credits.sql
-- 2. codes.sql

-- 1. Drop user_product_access table if it exists (cleanup)
DROP TABLE IF EXISTS user_product_access CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;

-- 2. Create simplified products table for storefront catalog
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  product_type TEXT NOT NULL,
  price_cents INTEGER NOT NULL, -- Price in SGD cents (100 = $1.00 SGD)
  currency TEXT DEFAULT 'SGD',
  image_url TEXT, -- Product image URL
  category TEXT,
  stock_count INTEGER NOT NULL DEFAULT 0, -- Available stock count
  sku TEXT, -- Stock Keeping Unit - use product-specific unique identifier
  -- Discount fields
  discount_percentage DECIMAL(5,2), -- Percentage discount (0.00 to 100.00)
  discount_amount_cents INTEGER, -- Fixed discount amount in cents
  discount_start_date TIMESTAMPTZ, -- When discount becomes active
  discount_end_date TIMESTAMPTZ, -- When discount expires
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB, -- Additional product data (ratings, reviews, features, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_products_type ON products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- 3. Create orders table (replaces user_purchases)
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

-- 4. Create order_items table for individual products in orders
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  status_code TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_cents INTEGER NOT NULL, -- Price at time of purchase
  total_price_cents INTEGER NOT NULL, -- unit_price_cents * quantity
  -- External fulfillment tracking fields (moved from orders table)
  tracking_number TEXT, -- Tracking number from external fulfillment provider
  external_status TEXT, -- Status from external fulfillment system
  fulfillment_provider TEXT, -- Name of external fulfillment provider
  fulfillment_webhook_data JSONB, -- Data received from fulfillment webhooks
  shipped_at TIMESTAMPTZ, -- When this item was shipped
  delivered_at TIMESTAMPTZ, -- When this item was delivered
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on new tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Grant permissions to service role for webhook processing
GRANT ALL ON products TO service_role;
GRANT ALL ON orders TO service_role;
GRANT ALL ON order_items TO service_role;
