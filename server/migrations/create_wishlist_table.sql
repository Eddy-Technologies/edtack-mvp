-- Create wishlist table for user wishlist management
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_info_id UUID NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint to prevent duplicate wishlist items
ALTER TABLE wishlists ADD CONSTRAINT unique_user_product 
  UNIQUE (user_info_id, product_id);