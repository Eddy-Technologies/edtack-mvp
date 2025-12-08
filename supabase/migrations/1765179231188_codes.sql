-- Generic Codes System
CREATE TABLE IF NOT EXISTS codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL, -- Machine-readable code (e.g., 'PENDING', 'CREDIT_TOPUP')
  name TEXT NOT NULL, -- Human-readable name (e.g., 'Payment Pending', 'Credit Top-up')
  category TEXT NOT NULL, -- Group constants by type ('order_status', 'operation_type', etc.)
  description TEXT, -- Detailed description
  sort_order INTEGER NOT NULL DEFAULT 0, -- For ordering within categories
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint on code + category combination
  UNIQUE(code, category)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_codes_code ON codes(code);
CREATE INDEX IF NOT EXISTS idx_codes_category ON codes(category);
CREATE INDEX IF NOT EXISTS idx_codes_active ON codes(is_active);
CREATE INDEX IF NOT EXISTS idx_codes_sort_order ON codes(sort_order);
CREATE INDEX IF NOT EXISTS idx_codes_category_active ON codes(category, is_active);
CREATE INDEX IF NOT EXISTS idx_codes_code_category ON codes(code, category);