-- Consolidated Seed Data for EdTack MVP Database
-- This file contains all INSERT statements from various migration files

-- =============================================================================
-- 1. ROLES SEED DATA
-- =============================================================================
INSERT INTO roles (id, role_name) VALUES
(1, 'ADMIN'),
(2, 'PARENT'), 
(3, 'STUDENT'),
(4, 'TEACHER');

-- =============================================================================
-- 2. LEVEL TYPES SEED DATA
-- =============================================================================
INSERT INTO level_types (level_type, description) VALUES
('PRIMARY_1', 'Primary School Level 1'),
('PRIMARY_2', 'Primary School Level 2'),
('PRIMARY_3', 'Primary School Level 3'),
('PRIMARY_4', 'Primary School Level 4'),
('PRIMARY_5', 'Primary School Level 5'),
('PRIMARY_6', 'Primary School Level 6'),
('SECONDARY_1', 'Secondary School Level 1'),
('SECONDARY_2', 'Secondary School Level 2'),
('SECONDARY_3', 'Secondary School Level 3'),
('SECONDARY_4', 'Secondary School Level 4'),
('SECONDARY_5', 'Secondary School Level 5'),
('JUNIOR_COLLEGE_1', 'Junior College Level 1'),
('JUNIOR_COLLEGE_2', 'Junior College Level 2');

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
('SG_SEC_ENG', 'English', 'Secondary English', 'Singapore Secondary English', 'SG');

-- =============================================================================
-- 4. SYSTEM CODES SEED DATA
-- =============================================================================

-- Order Status Constants
INSERT INTO codes (code, name, description, category, sort_order, is_active, created_at, updated_at) VALUES
('PENDING', 'Payment Pending', 'Order created but payment not yet processed', 'order_status', 10, true, NOW(), NOW()),
('PAID', 'Payment Successful', 'Payment completed successfully', 'order_status', 20, true, NOW(), NOW()),
('CONFIRMED', 'Order Confirmed', 'Order confirmed and sent to external fulfillment', 'order_status', 30, true, NOW(), NOW()),
('CANCELLED', 'Cancelled', 'Order has been cancelled', 'order_status', 40, true, NOW(), NOW()),
('REFUNDED', 'Refunded', 'Refund has been completed', 'order_status', 50, true, NOW(), NOW()),
-- Additional purchase flow statuses
('PENDING_PARENT_APPROVAL', 'Pending Parent Approval', 'Order waiting for parent approval before payment', 'order_status', 15, true, NOW(), NOW()),
('PENDING_PAYMENT', 'Pending Payment', 'Order created, redirecting to payment gateway', 'order_status', 18, true, NOW(), NOW()),
('PARENT_APPROVED', 'Parent Approved', 'Parent has approved the purchase, payment processing', 'order_status', 25, true, NOW(), NOW()),
('REJECTED', 'Rejected', 'Order has been rejected', 'order_status', 22, true, NOW(), NOW());

-- Operation Type Constants  
INSERT INTO codes (code, name, description, category, sort_order, is_active, created_at, updated_at) VALUES
('CREDIT_TOPUP', 'Credit Top-up', 'Customer credit balance top-up transaction', 'operation_type', 10, true, NOW(), NOW()),
('TRANSFER_OUT', 'Transfer Out', 'Credits transferred out to another account', 'operation_type', 20, true, NOW(), NOW()),
('TRANSFER_IN', 'Transfer In', 'Credits received from another account', 'operation_type', 30, true, NOW(), NOW()),
('BALANCE_ADJUSTMENT', 'Balance Adjustment', 'Manual balance adjustment by administrator', 'operation_type', 40, true, NOW(), NOW()),
('PURCHASE', 'Purchase', 'Product purchase using customer credit balance', 'operation_type', 50, true, NOW(), NOW());

-- Task Status Constants
INSERT INTO codes (code, name, description, category, sort_order, is_active, created_at, updated_at) VALUES
('TASK_PENDING', 'Pending', 'Task created but not started', 'task_status', 10, true, NOW(), NOW()),
('IN_PROGRESS', 'In Progress', 'Task is being worked on', 'task_status', 20, true, NOW(), NOW()),
('COMPLETED', 'Completed', 'Task completed by child, awaiting approval', 'task_status', 30, true, NOW(), NOW()),
('APPROVED', 'Approved', 'Task approved by parent, credits awarded', 'task_status', 40, true, NOW(), NOW()),
('REJECTED', 'Rejected', 'Task rejected by parent, no credits awarded', 'task_status', 50, true, NOW(), NOW()),
('TASK_CANCELLED', 'Cancelled', 'Task cancelled before completion', 'task_status', 60, true, NOW(), NOW()),
('EXPIRED', 'Expired', 'Task expired past due date', 'task_status', 70, true, NOW(), NOW());

-- Task Priority Constants
INSERT INTO codes (code, name, description, category, sort_order, is_active, created_at, updated_at) VALUES
('LOW', 'Low Priority', 'Low priority task', 'task_priority', 10, true, NOW(), NOW()),
('MEDIUM', 'Medium Priority', 'Medium priority task', 'task_priority', 20, true, NOW(), NOW()),
('HIGH', 'High Priority', 'High priority task', 'task_priority', 30, true, NOW(), NOW());

-- Recurrence Frequency Constants
INSERT INTO codes (code, name, description, category, sort_order, is_active, created_at, updated_at) VALUES
('DAILY', 'Daily', 'Task repeats every day', 'recurrence_frequency', 10, true, NOW(), NOW()),
('WEEKLY', 'Weekly', 'Task repeats every week', 'recurrence_frequency', 20, true, NOW(), NOW()),
('MONTHLY', 'Monthly', 'Task repeats every month', 'recurrence_frequency', 30, true, NOW(), NOW());

-- =============================================================================
-- 5. SAMPLE PRODUCTS FOR TESTING
-- =============================================================================

-- Insert sample products with all fields
INSERT INTO products (
  name, description, product_type, price_cents, currency, 
  category, image_url, stock_count, sku, 
  discount_percentage, discount_amount_cents, discount_start_date, discount_end_date,
  is_active, metadata, created_at, updated_at
) VALUES
-- Gift Cards
('KFC Gift Card - S$20', 'S$20 KFC Gift Card for delicious fried chicken and sides', 'gift_card', 2000, 'SGD',
 'Food & Dining', 'https://via.placeholder.com/300x200?text=KFC+Gift+Card', 100, 'KFC-GC-20',
 NULL, NULL, NULL, NULL,
 true, '{"rating": 4.5, "review_count": "120", "is_new": "false", "sample_data": "true"}', NOW(), NOW()),

('Grab Food Voucher - S$15', 'S$15 Grab Food delivery voucher for your favorite meals', 'gift_card', 1500, 'SGD',
 'Food & Dining', 'https://via.placeholder.com/300x200?text=Grab+Food+Voucher', 50, 'GRAB-FD-15',
 10.00, NULL, NOW(), NOW() + INTERVAL '30 days',
 true, '{"rating": 4.7, "review_count": "89", "is_new": "false", "sample_data": "true"}', NOW(), NOW()),

-- Digital Products  
('Fortnite V-Bucks - 1000', '1000 V-Bucks for Fortnite Battle Royale - cosmetics and battle pass', 'digital', 1500, 'SGD',
 'Gaming', 'https://via.placeholder.com/300x200?text=Fortnite+V-Bucks', 999, 'FORT-VB-1000',
 NULL, NULL, NULL, NULL,
 true, '{"rating": 4.8, "review_count": "156", "is_new": "true", "sample_data": "true"}', NOW(), NOW()),

('Roblox Gift Card - S$10', 'S$10 Roblox gift card for Robux and premium memberships', 'digital', 1000, 'SGD',
 'Gaming', 'https://via.placeholder.com/300x200?text=Roblox+Gift+Card', 200, 'RBLX-GC-10',
 NULL, 100, NOW() - INTERVAL '7 days', NOW() + INTERVAL '7 days',
 true, '{"rating": 4.6, "review_count": "203", "is_new": "false", "sample_data": "true"}', NOW(), NOW()),

-- Physical Products
('Pikachu Plush Toy', 'Official Nintendo Pikachu plush toy - soft and cuddly', 'physical', 2500, 'SGD',
 'Toys', 'https://via.placeholder.com/300x200?text=Pikachu+Plush', 25, 'POKE-PIKA-01',
 20.00, NULL, NOW(), NOW() + INTERVAL '14 days',
 true, '{"rating": 4.9, "review_count": "45", "is_new": "false", "sample_data": "true"}', NOW(), NOW()),

('Math Workbook Set', 'Complete set of Primary 6 math workbooks with answer keys', 'physical', 3500, 'SGD',
 'Education', 'https://via.placeholder.com/300x200?text=Math+Workbooks', 30, 'EDU-MATH-P6',
 NULL, NULL, NULL, NULL,
 true, '{"rating": 4.4, "review_count": "78", "is_new": "false", "sample_data": "true"}', NOW(), NOW()),

-- Courses
('Premium Math Course', 'Lifetime access to interactive Primary 6 math lessons', 'course', 4999, 'SGD',
 'Education', 'https://via.placeholder.com/300x200?text=Premium+Math+Course', 999, 'CRS-MATH-PREM',
 15.00, NULL, NOW() - INTERVAL '3 days', NOW() + INTERVAL '60 days',
 true, '{"rating": 4.9, "review_count": "67", "is_new": "true", "sample_data": "true"}', NOW(), NOW()),

('Science Experiment Kit', 'DIY science experiments with step-by-step video guides', 'course', 2999, 'SGD',
 'Education', 'https://via.placeholder.com/300x200?text=Science+Kit', 15, 'CRS-SCI-KIT',
 NULL, NULL, NULL, NULL,
 false, '{"rating": 4.7, "review_count": "34", "is_new": "false", "sample_data": "true", "note": "Out of stock until next batch"}', NOW(), NOW())
ON CONFLICT (sku) DO NOTHING;

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