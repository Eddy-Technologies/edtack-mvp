-- Sample Products for Testing the Simplified Storefront
-- Run this AFTER running migrations_storefront.sql
-- These are example products to test the new SGD-based purchase flow

-- Clear existing sample data (optional)  
-- DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE notes LIKE '%sample%');
-- DELETE FROM orders WHERE notes LIKE '%sample%';
-- DELETE FROM products WHERE metadata->>'sample_data' = 'true';

-- Insert sample products with all fields
INSERT INTO products (
  name, description, product_type, price_cents, currency, 
  category, image_url, stock_count, sku, 
  discount_percentage, discount_amount_cents, discount_start_date, discount_end_date,
  is_active, metadata
) VALUES
-- Gift Cards
('KFC Gift Card - S$20', 'S$20 KFC Gift Card for delicious fried chicken and sides', 'gift_card', 2000, 'SGD',
 'Food & Dining', 'https://via.placeholder.com/300x200?text=KFC+Gift+Card', 100, 'KFC-GC-20',
 NULL, NULL, NULL, NULL,
 true, '{"rating": 4.5, "review_count": "120", "is_new": "false", "sample_data": "true"}'),

('Grab Food Voucher - S$15', 'S$15 Grab Food delivery voucher for your favorite meals', 'gift_card', 1500, 'SGD',
 'Food & Dining', 'https://via.placeholder.com/300x200?text=Grab+Food+Voucher', 50, 'GRAB-FD-15',
 10.00, NULL, NOW(), NOW() + INTERVAL '30 days',
 true, '{"rating": 4.7, "review_count": "89", "is_new": "false", "sample_data": "true"}'),

-- Digital Products  
('Fortnite V-Bucks - 1000', '1000 V-Bucks for Fortnite Battle Royale - cosmetics and battle pass', 'digital', 1500, 'SGD',
 'Gaming', 'https://via.placeholder.com/300x200?text=Fortnite+V-Bucks', 999, 'FORT-VB-1000',
 NULL, NULL, NULL, NULL,
 true, '{"rating": 4.8, "review_count": "156", "is_new": "true", "sample_data": "true"}'),

('Roblox Gift Card - S$10', 'S$10 Roblox gift card for Robux and premium memberships', 'digital', 1000, 'SGD',
 'Gaming', 'https://via.placeholder.com/300x200?text=Roblox+Gift+Card', 200, 'RBLX-GC-10',
 NULL, 100, NOW() - INTERVAL '7 days', NOW() + INTERVAL '7 days',
 true, '{"rating": 4.6, "review_count": "203", "is_new": "false", "sample_data": "true"}'),

-- Physical Products
('Pikachu Plush Toy', 'Official Nintendo Pikachu plush toy - soft and cuddly', 'physical', 2500, 'SGD',
 'Toys', 'https://via.placeholder.com/300x200?text=Pikachu+Plush', 25, 'POKE-PIKA-01',
 20.00, NULL, NOW(), NOW() + INTERVAL '14 days',
 true, '{"rating": 4.9, "review_count": "45", "is_new": "false", "sample_data": "true"}'),

('Math Workbook Set', 'Complete set of Primary 6 math workbooks with answer keys', 'physical', 3500, 'SGD',
 'Education', 'https://via.placeholder.com/300x200?text=Math+Workbooks', 30, 'EDU-MATH-P6',
 NULL, NULL, NULL, NULL,
 true, '{"rating": 4.4, "review_count": "78", "is_new": "false", "sample_data": "true"}'),

-- Courses
('Premium Math Course', 'Lifetime access to interactive Primary 6 math lessons', 'course', 4999, 'SGD',
 'Education', 'https://via.placeholder.com/300x200?text=Premium+Math+Course', 999, 'CRS-MATH-PREM',
 15.00, NULL, NOW() - INTERVAL '3 days', NOW() + INTERVAL '60 days',
 true, '{"rating": 4.9, "review_count": "67", "is_new": "true", "sample_data": "true"}'),

('Science Experiment Kit', 'DIY science experiments with step-by-step video guides', 'course', 2999, 'SGD',
 'Education', 'https://via.placeholder.com/300x200?text=Science+Kit', 15, 'CRS-SCI-KIT',
 NULL, NULL, NULL, NULL,
 false, '{"rating": 4.7, "review_count": "34", "is_new": "false", "sample_data": "true", "note": "Out of stock until next batch"}');

-- Verify the data was inserted
SELECT 
  name, 
  sku,
  product_type, 
  price_cents, 
  ROUND(price_cents / 100.0, 2) as price_sgd,
  stock_count,
  CASE 
    WHEN discount_percentage IS NOT NULL THEN discount_percentage || '%'
    WHEN discount_amount_cents IS NOT NULL THEN 'S$' || ROUND(discount_amount_cents / 100.0, 2)
    ELSE 'No discount'
  END as discount,
  category,
  is_active,
  metadata->>'rating' as rating
FROM products 
WHERE metadata->>'sample_data' = 'true'
ORDER BY category, price_cents;