-- Order Items table for individual products in orders
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

-- Grant permissions to service role for webhook processing
GRANT ALL ON order_items TO service_role;