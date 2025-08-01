-- Consolidated Seed Data for EdTack MVP Database
-- This file contains all INSERT statements from various migration files

-- =============================================================================
-- 1. ROLES SEED DATA
-- =============================================================================
INSERT INTO roles (id, role_name) VALUES
(1, 'PARENT'),
(2, 'TEACHER'), 
(3, 'STUDENT')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 2. LEVEL TYPES SEED DATA
-- =============================================================================
INSERT INTO level_types (level_type, description) VALUES
('Primary 1', 'Primary School Level 1'),
('Primary 2', 'Primary School Level 2'),
('Primary 3', 'Primary School Level 3'),
('Primary 4', 'Primary School Level 4'),
('Primary 5', 'Primary School Level 5'),
('Primary 6', 'Primary School Level 6'),
('Secondary 1', 'Secondary School Level 1'),
('Secondary 2', 'Secondary School Level 2'),
('Secondary 3', 'Secondary School Level 3'),
('Secondary 4', 'Secondary School Level 4'),
('Secondary 5', 'Secondary School Level 5'),
('Junior College 1', 'Junior College Level 1'),
('Junior College 2', 'Junior College Level 2')
ON CONFLICT (level_type) DO NOTHING;

-- =============================================================================
-- 3. SUBJECTS SEED DATA (Singapore Education System)
-- =============================================================================
INSERT INTO subjects (name, subject_name, display_name, description, country_code) VALUES
('SG_PRIMARY_MATH_1', 'Mathematics', 'Primary 1 Mathematics', 'Singapore Primary 1 Mathematics curriculum', 'SG'),
('SG_PRIMARY_MATH_2', 'Mathematics', 'Primary 2 Mathematics', 'Singapore Primary 2 Mathematics curriculum', 'SG'),
('SG_PRIMARY_MATH_3', 'Mathematics', 'Primary 3 Mathematics', 'Singapore Primary 3 Mathematics curriculum', 'SG'),
('SG_PRIMARY_MATH_4', 'Mathematics', 'Primary 4 Mathematics', 'Singapore Primary 4 Mathematics curriculum', 'SG'),
('SG_PRIMARY_MATH_5', 'Mathematics', 'Primary 5 Mathematics', 'Singapore Primary 5 Mathematics curriculum', 'SG'),
('SG_PRIMARY_MATH_6', 'Mathematics', 'Primary 6 Mathematics', 'Singapore Primary 6 Mathematics curriculum', 'SG'),
('SG_PRIMARY_ENG_1', 'English', 'Primary 1 English', 'Singapore Primary 1 English curriculum', 'SG'),
('SG_PRIMARY_ENG_2', 'English', 'Primary 2 English', 'Singapore Primary 2 English curriculum', 'SG'),
('SG_PRIMARY_ENG_3', 'English', 'Primary 3 English', 'Singapore Primary 3 English curriculum', 'SG'),
('SG_PRIMARY_ENG_4', 'English', 'Primary 4 English', 'Singapore Primary 4 English curriculum', 'SG'),
('SG_PRIMARY_ENG_5', 'English', 'Primary 5 English', 'Singapore Primary 5 English curriculum', 'SG'),
('SG_PRIMARY_ENG_6', 'English', 'Primary 6 English', 'Singapore Primary 6 English curriculum', 'SG'),
('SG_PSLE_MATH', 'Mathematics', 'PSLE Mathematics', 'Singapore PSLE Mathematics', 'SG'),
('SG_PSLE_ENG', 'English', 'PSLE English', 'Singapore PSLE English', 'SG'),
('SG_PSLE_SCI', 'Science', 'PSLE Science', 'Singapore PSLE Science', 'SG'),
('SG_PSLE_MT', 'Mother Tongue', 'PSLE Mother Tongue', 'Singapore PSLE Mother Tongue Languages', 'SG'),
('SG_SEC_MATH', 'Mathematics', 'Secondary Mathematics', 'Singapore Secondary Mathematics', 'SG'),
('SG_SEC_ENG', 'English', 'Secondary English', 'Singapore Secondary English', 'SG')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- 4. SYSTEM CODES SEED DATA
-- =============================================================================

-- Order Status Constants
INSERT INTO codes (code, name, description, category, sort_order) VALUES
('pending', 'Payment Pending', 'Order created but payment not yet processed', 'order_status', 10),
('paid', 'Payment Successful', 'Payment completed successfully', 'order_status', 20),
('confirmed', 'Order Confirmed', 'Order confirmed and sent to external fulfillment', 'order_status', 30),
('cancelled', 'Cancelled', 'Order has been cancelled', 'order_status', 40),
('refunded', 'Refunded', 'Refund has been completed', 'order_status', 50),
-- Additional purchase flow statuses
('pending_parent_approval', 'Pending Parent Approval', 'Order waiting for parent approval before payment', 'order_status', 15),
('pending_payment', 'Pending Payment', 'Order created, redirecting to payment gateway', 'order_status', 18),
('parent_approved', 'Parent Approved', 'Parent has approved the purchase, payment processing', 'order_status', 25)
ON CONFLICT (code) DO NOTHING;

-- Operation Type Constants  
INSERT INTO codes (code, name, description, category, sort_order) VALUES
('credit_topup', 'Credit Top-up', 'Customer credit balance top-up transaction', 'operation_type', 10),
('transfer_out', 'Transfer Out', 'Credits transferred out to another account', 'operation_type', 20),
('transfer_in', 'Transfer In', 'Credits received from another account', 'operation_type', 30),
('balance_adjustment', 'Balance Adjustment', 'Manual balance adjustment by administrator', 'operation_type', 40),
('purchase', 'Purchase', 'Product purchase using customer credit balance', 'operation_type', 50)
ON CONFLICT (code) DO NOTHING;

-- Task Status Constants
INSERT INTO codes (code, name, description, category, sort_order) VALUES
('pending', 'Pending', 'Task created but not started', 'task_status', 10),
('in_progress', 'In Progress', 'Task is being worked on', 'task_status', 20),
('completed', 'Completed', 'Task completed by child, awaiting approval', 'task_status', 30),
('approved', 'Approved', 'Task approved by parent, credits awarded', 'task_status', 40),
('rejected', 'Rejected', 'Task rejected by parent, no credits awarded', 'task_status', 50),
('cancelled', 'Cancelled', 'Task cancelled before completion', 'task_status', 60),
('expired', 'Expired', 'Task expired past due date', 'task_status', 70)
ON CONFLICT (code) DO NOTHING;

-- Task Priority Constants
INSERT INTO codes (code, name, description, category, sort_order) VALUES
('low', 'Low Priority', 'Low priority task', 'task_priority', 10),
('medium', 'Medium Priority', 'Medium priority task', 'task_priority', 20),
('high', 'High Priority', 'High priority task', 'task_priority', 30)
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- 5. SAMPLE PRODUCTS FOR TESTING
-- =============================================================================

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
 false, '{"rating": 4.7, "review_count": "34", "is_new": "false", "sample_data": "true", "note": "Out of stock until next batch"}')
ON CONFLICT (sku) DO NOTHING;

-- =============================================================================
-- 6. USER CREDITS INITIALIZATION (for existing users)
-- =============================================================================

-- Initialize user_credits for existing user_infos that don't have credit records yet
INSERT INTO user_credits (user_info_id, credit, reserved_credit)
SELECT ui.id, 0, 0
FROM user_infos ui
LEFT JOIN user_credits uc ON ui.id = uc.user_info_id
WHERE uc.user_info_id IS NULL
ON CONFLICT (user_info_id) DO NOTHING;

-- =============================================================================
-- VERIFICATION QUERIES (Optional - for debugging)
-- =============================================================================

-- Uncomment to verify data after seeding:

-- SELECT 'Roles:', * FROM roles ORDER BY id;
-- SELECT 'Level Types:', * FROM level_types ORDER BY level_type;
-- SELECT 'Sample Products:', name, sku, price_cents/100.0 as price_sgd, category FROM products WHERE metadata->>'sample_data' = 'true' ORDER BY category, price_cents;
-- SELECT 'System Codes:', category, count(*) as count FROM codes GROUP BY category ORDER BY category;