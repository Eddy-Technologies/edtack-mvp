-- Products table for storefront catalog
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
  sku TEXT UNIQUE, -- Stock Keeping Unit - use product-specific unique identifier
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
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- Grant permissions to service role for webhook processing
GRANT ALL ON products TO service_role;