-- Generic Codes System
CREATE TABLE IF NOT EXISTS codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- Machine-readable code (e.g., 'pending', 'credit_topup')
  name TEXT NOT NULL, -- Human-readable name (e.g., 'Payment Pending', 'Credit Top-up')
  description TEXT, -- Detailed description
  category TEXT NOT NULL, -- Group constants by type ('order_status', 'operation_type', etc.)
  sort_order INTEGER NOT NULL DEFAULT 0, -- For ordering within categories
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_codes_code ON codes(code);
CREATE INDEX IF NOT EXISTS idx_codes_category ON codes(category);
CREATE INDEX IF NOT EXISTS idx_codes_active ON codes(is_active);
CREATE INDEX IF NOT EXISTS idx_codes_sort_order ON codes(sort_order);
CREATE INDEX IF NOT EXISTS idx_codes_category_active ON codes(category, is_active);

-- Enable RLS
ALTER TABLE codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow read access to authenticated users
CREATE POLICY "Anyone can view active codes" ON codes
  FOR SELECT USING (is_active = TRUE);

-- Grant permissions
GRANT SELECT ON codes TO authenticated;
GRANT ALL ON codes TO service_role;

-- Add trigger for updated_at
CREATE TRIGGER update_codes_updated_at BEFORE UPDATE ON codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();