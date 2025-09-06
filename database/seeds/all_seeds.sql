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
-- 4. SYSTEM CODES SEED DATA
-- =============================================================================

-- Order Status Constants
INSERT INTO codes (code, name, description, category, sort_order, is_active, created_at, updated_at) VALUES
('PENDING', 'Payment Pending', 'Order created but payment not yet processed', 'ORDER_STATUS', 10, true, NOW(), NOW()),
('PAID', 'Payment Successful', 'Payment completed successfully', 'ORDER_STATUS', 20, true, NOW(), NOW()),
('CONFIRMED', 'Order Confirmed', 'Order confirmed and sent to external fulfillment', 'ORDER_STATUS', 30, true, NOW(), NOW()),
('CANCELLED', 'Cancelled', 'Order has been cancelled', 'ORDER_STATUS', 40, true, NOW(), NOW()),
('REFUNDED', 'Refunded', 'Refund has been completed', 'ORDER_STATUS', 50, true, NOW(), NOW()),
-- Additional purchase flow statuses
('PENDING_PARENT_APPROVAL', 'Pending Parent Approval', 'Order waiting for parent approval before payment', 'ORDER_STATUS', 15, true, NOW(), NOW()),
('PENDING_PAYMENT', 'Pending Payment', 'Order created, redirecting to payment gateway', 'ORDER_STATUS', 18, true, NOW(), NOW()),
('PARENT_APPROVED', 'Parent Approved', 'Parent has approved the purchase, payment processing', 'ORDER_STATUS', 25, true, NOW(), NOW()),
('REJECTED', 'Rejected', 'Order has been rejected', 'ORDER_STATUS', 22, true, NOW(), NOW());

-- Operation Type Constants  
INSERT INTO codes (code, name, description, category, sort_order, is_active, created_at, updated_at) VALUES
('CREDIT_TOPUP', 'Credit Top-up', 'Customer credit balance top-up transaction', 'OPERATION_TYPE', 10, true, NOW(), NOW()),
('TRANSFER_OUT', 'Transfer Out', 'Credits transferred out to another account', 'OPERATION_TYPE', 20, true, NOW(), NOW()),
('TRANSFER_IN', 'Transfer In', 'Credits received from another account', 'OPERATION_TYPE', 30, true, NOW(), NOW()),
('BALANCE_ADJUSTMENT', 'Balance Adjustment', 'Manual balance adjustment by administrator', 'OPERATION_TYPE', 40, true, NOW(), NOW()),
('PURCHASE', 'Purchase', 'Product purchase using customer credit balance', 'OPERATION_TYPE', 50, true, NOW(), NOW());

-- Task Status Constants (for user_tasks - master task definitions)
INSERT INTO codes (code, name, description, category, sort_order, is_active, created_at, updated_at) VALUES
('OPEN', 'Open', 'Task is active and can generate new threads', 'TASK_STATUS', 10, true, NOW(), NOW()),
('CLOSED', 'Closed', 'Task has been manually stopped/disabled', 'TASK_STATUS', 20, true, NOW(), NOW()),
('EXPIRED', 'Expired', 'Task has reached its end date or been automatically expired', 'TASK_STATUS', 30, true, NOW(), NOW());

-- Task Thread Status Constants (for task_threads - individual task instances)
INSERT INTO codes (code, name, description, category, sort_order, is_active, created_at, updated_at) VALUES
('OPEN', 'Open', 'Thread is active, awaiting completion', 'TASK_THREAD_STATUS', 10, true, NOW(), NOW()),
('COMPLETED', 'Completed', 'Thread has been completed by student', 'TASK_THREAD_STATUS', 20, true, NOW(), NOW()),
('EXPIRED', 'Expired', 'Thread passed due date without completion', 'TASK_THREAD_STATUS', 30, true, NOW(), NOW());

-- Recurrence Frequency Constants
INSERT INTO codes (code, name, description, category, sort_order, is_active, created_at, updated_at) VALUES
('ONE_OFF', 'One-off', 'Task occurs once only', 'RECURRENCE_FREQUENCY', 5, true, NOW(), NOW()),
('DAILY', 'Daily', 'Task repeats every day', 'RECURRENCE_FREQUENCY', 10, true, NOW(), NOW()),
('WEEKLY', 'Weekly', 'Task repeats every week', 'RECURRENCE_FREQUENCY', 20, true, NOW(), NOW()),
('MONTHLY', 'Monthly', 'Task repeats every month', 'RECURRENCE_FREQUENCY', 30, true, NOW(), NOW());

-- Order Fulfillment Constants
INSERT INTO codes (code, name, description, category, sort_order, is_active, created_at, updated_at) VALUES
('PENDING_FULFILLMENT', 'Pending Fulfillment', 'Order is awaiting fulfillment', 'ORDER_FULFILLMENT', 10, true, NOW(), NOW()),
('PROCESSING', 'Processing', 'Order is being processed for fulfillment', 'ORDER_FULFILLMENT', 20, true, NOW(), NOW()),
('SHIPPED', 'Shipped', 'Order has been shipped to customer', 'ORDER_FULFILLMENT', 30, true, NOW(), NOW()),
('DELIVERED', 'Delivered', 'Order has been delivered to customer', 'ORDER_FULFILLMENT', 40, true, NOW(), NOW()),
('FAILED', 'Failed', 'Order fulfillment failed', 'ORDER_FULFILLMENT', 50, true, NOW(), NOW()),
('CANCELLED', 'Cancelled', 'Order fulfillment was cancelled', 'ORDER_FULFILLMENT', 60, true, NOW(), NOW());

-- Task Category Constants
INSERT INTO codes (code, name, description, category, sort_order, is_active, created_at, updated_at) VALUES
('CHORES', 'Chores', 'Household chores and cleaning tasks', 'TASK_CATEGORY', 10, true, NOW(), NOW()),
('HOMEWORK', 'Homework', 'School homework and study tasks', 'TASK_CATEGORY', 20, true, NOW(), NOW()),
('BEHAVIOR', 'Behavior', 'Behavior improvement tasks', 'TASK_CATEGORY', 30, true, NOW(), NOW()),
('EXERCISE', 'Exercise', 'Physical exercise and sports tasks', 'TASK_CATEGORY', 40, true, NOW(), NOW()),
('READING', 'Reading', 'Reading and learning tasks', 'TASK_CATEGORY', 50, true, NOW(), NOW()),
('OTHER', 'Other', 'Other miscellaneous tasks', 'TASK_CATEGORY', 60, true, NOW(), NOW());

-- Subject Constants
INSERT INTO codes (code, name, description, category, sort_order, is_active, created_at, updated_at) VALUES
('GENERAL', 'General', 'General educational content', 'SUBJECT', 10, true, NOW(), NOW()),
('BIOLOGY', 'Biology', 'Biology curriculum', 'SUBJECT', 20, true, NOW(), NOW()),
('CHEMISTRY', 'Chemistry', 'Chemistry curriculum', 'SUBJECT', 30, true, NOW(), NOW()),
('PHYSICS', 'Physics', 'Physics curriculum', 'SUBJECT', 40, true, NOW(), NOW()),
('COMBINED_SCIENCE', 'Combined Science', 'Combined Science curriculum', 'SUBJECT', 50, true, NOW(), NOW()),
('MATHEMATICS', 'Mathematics', 'Mathematics curriculum', 'SUBJECT', 60, true, NOW(), NOW()),
('ADDITIONAL_MATHEMATICS', 'Additional Mathematics', 'Additional Mathematics curriculum', 'SUBJECT', 70, true, NOW(), NOW()),
('ENGLISH', 'English', 'English language curriculum', 'SUBJECT', 80, true, NOW(), NOW()),
('LITERATURE', 'Literature', 'Literature curriculum', 'SUBJECT', 90, true, NOW(), NOW()),
('SOCIAL_STUDIES', 'Social Studies', 'Social Studies curriculum', 'SUBJECT', 100, true, NOW(), NOW()),
('HISTORY', 'History', 'History curriculum', 'SUBJECT', 110, true, NOW(), NOW()),
('GEOGRAPHY', 'Geography', 'Geography curriculum', 'SUBJECT', 120, true, NOW(), NOW());

-- Lesson Generation Type Constants
INSERT INTO codes (code, name, description, category, sort_order, is_active, created_at, updated_at) VALUES
('QUIZ', 'Quiz', 'Generate quiz questions and assessments', 'LESSON_GENERATION_TYPE', 10, true, NOW(), NOW()),
('LESSON', 'Lesson', 'Generate lesson content and materials', 'LESSON_GENERATION_TYPE', 20, true, NOW(), NOW());

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