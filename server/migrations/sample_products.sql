-- Sample Products for Testing the Simplified Storefront
-- Run this AFTER running migrations_storefront.sql
-- These are example products to test the new SGD-based purchase flow

-- Clear existing sample data (optional)  
-- DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE notes LIKE '%sample%');
-- DELETE FROM orders WHERE notes LIKE '%sample%';
-- DELETE FROM products WHERE metadata->>'sample_data' = 'true';

-- Insert sample products
INSERT INTO products (name, description, product_type, price_cents, category, image_url, metadata) VALUES
-- Gift Cards
('KFC Gift Card - S$20', 'S$20 KFC Gift Card for delicious fried chicken and sides', 'gift_card', 2000, 'Food & Dining', 'https://via.placeholder.com/300x200?text=KFC+Gift+Card', 
 '{"rating": 4.5, "review_count": "120", "is_new": "false", "sample_data": "true"}'),

('Grab Food Voucher - S$15', 'S$15 Grab Food delivery voucher for your favorite meals', 'gift_card', 1500, 'Food & Dining', 'https://via.placeholder.com/300x200?text=Grab+Food+Voucher', 
 '{"rating": 4.7, "review_count": "89", "is_new": "false", "sample_data": "true"}'),

-- Digital Products  
('Fortnite V-Bucks - 1000', '1000 V-Bucks for Fortnite Battle Royale - cosmetics and battle pass', 'digital', 1500, 'Gaming', 'https://via.placeholder.com/300x200?text=Fortnite+V-Bucks', 
 '{"rating": 4.8, "review_count": "156", "is_new": "true", "sample_data": "true"}'),

('Roblox Gift Card - S$10', 'S$10 Roblox gift card for Robux and premium memberships', 'digital', 1000, 'Gaming', 'https://via.placeholder.com/300x200?text=Roblox+Gift+Card', 
 '{"rating": 4.6, "review_count": "203", "is_new": "false", "sample_data": "true"}'),

-- Physical Products
('Pikachu Plush Toy', 'Official Nintendo Pikachu plush toy - soft and cuddly', 'physical', 2500, 'Toys', 'https://via.placeholder.com/300x200?text=Pikachu+Plush', 
 '{"rating": 4.9, "review_count": "45", "is_new": "false", "sample_data": "true"}'),

('Math Workbook Set', 'Complete set of Primary 6 math workbooks with answer keys', 'physical', 3500, 'Education', 'https://via.placeholder.com/300x200?text=Math+Workbooks', 
 '{"rating": 4.4, "review_count": "78", "is_new": "false", "sample_data": "true"}'),

-- Courses
('Premium Math Course', 'Lifetime access to interactive Primary 6 math lessons', 'course', 4999, 'Education', 'https://via.placeholder.com/300x200?text=Premium+Math+Course', 
 '{"rating": 4.9, "review_count": "67", "is_new": "true", "sample_data": "true"}'),

('Science Experiment Kit', 'DIY science experiments with step-by-step video guides', 'course', 2999, 'Education', 'https://via.placeholder.com/300x200?text=Science+Kit', 
 '{"rating": 4.7, "review_count": "34", "is_new": "false", "sample_data": "true"}');

-- Verify the data was inserted
SELECT 
  name, 
  product_type, 
  price_cents, 
  ROUND(price_cents / 100.0, 2) as price_sgd,
  category,
  metadata->>'rating' as rating,
  metadata->>'review_count' as reviews
FROM products 
WHERE metadata->>'sample_data' = 'true'
ORDER BY category, price_cents;