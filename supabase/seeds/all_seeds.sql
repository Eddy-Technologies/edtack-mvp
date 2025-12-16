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

-- Task Status Constants (for user_tasks - task assignments)
INSERT INTO codes (code, name, description, category, sort_order, is_active, created_at, updated_at) VALUES
('OPEN', 'Open', 'Task is active and assigned', 'TASK_STATUS', 10, true, NOW(), NOW()),
('CLOSED', 'Closed', 'Task has been manually closed/disabled', 'TASK_STATUS', 20, true, NOW(), NOW()),
('EXPIRED', 'Expired', 'Task has reached its end date or been automatically expired', 'TASK_STATUS', 30, true, NOW(), NOW());

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

-- Marking Status Constants (for AI/manual marking results)
INSERT INTO codes (code, name, description, category, sort_order, is_active, created_at, updated_at) VALUES
('CORRECT', 'Correct', 'Answer is fully correct', 'MARKING_STATUS', 10, true, NOW(), NOW()),
('PARTIALLY_CORRECT', 'Partially Correct', 'Answer is partially correct with some gaps', 'MARKING_STATUS', 20, true, NOW(), NOW()),
('INCORRECT', 'Incorrect', 'Answer is incorrect', 'MARKING_STATUS', 30, true, NOW(), NOW());

-- =============================================================================
-- 4.5. SUBSCRIPTION TIER LIMITS SEED DATA
-- =============================================================================

-- Token limits for each subscription tier (configurable)
INSERT INTO subscription_tier_limits (tier_lookup_key, display_name, token_limit_monthly, is_active, created_at, updated_at) VALUES
('EDDY_FREE_MONTHLY', 'Free Monthly', 500000, true, NOW(), NOW()),
('EDDY_FREE_YEARLY', 'Free Yearly', 500000, true, NOW(), NOW()),
('EDDY_PRO_MONTHLY', 'Pro Monthly', 0, true, NOW(), NOW()),  -- 0 = unlimited
('EDDY_PRO_YEARLY', 'Pro Yearly', 0, true, NOW(), NOW()),    -- 0 = unlimited
('EDDY_MAX_MONTHLY', 'Max Monthly', 0, true, NOW(), NOW()),  -- 0 = unlimited
('EDDY_MAX_YEARLY', 'Max Yearly', 0, true, NOW(), NOW())     -- 0 = unlimited
ON CONFLICT (tier_lookup_key) DO NOTHING;

-- =============================================================================
-- 5. SAMPLE PRODUCTS FOR TESTING
-- =============================================================================

-- Delete existing sample products first to avoid duplicates
DELETE FROM products WHERE metadata->>'sample_data' = 'true';

-- Insert sample products with all fields
-- Image URLs use 'products/' prefix - resolved by API to full Supabase storage URL
INSERT INTO products (
  name, description, product_type, price_cents, currency,
  category, image_url, stock_count, sku,
  discount_percentage, discount_amount_cents, discount_start_date, discount_end_date,
  is_active, metadata, created_at, updated_at
) VALUES
-- Gaming / Digital
('Fortnite V-Bucks - 1000', '1000 V-Bucks for Fortnite Battle Royale. Get skins, emotes, and battle pass!', 'digital', 1500, 'SGD',
 'Gaming', 'products/a.png', 999, 'FORT-VB-1000',
 NULL, NULL, NULL, NULL,
 true, '{"sample_data": "true"}', NOW(), NOW()),

('Roblox Gift Card - S$30', 'S$30 Roblox gift card for Robux. Build, play, and explore endless games!', 'digital', 3000, 'SGD',
 'Gaming', 'products/e.png', 200, 'RBLX-GC-30',
 NULL, NULL, NULL, NULL,
 true, '{"sample_data": "true"}', NOW(), NOW()),

('Riot Points - S$30', 'S$30 worth of Riot Points for League of Legends and Valorant', 'digital', 3000, 'SGD',
 'Gaming', 'products/c.png', 150, 'RIOT-RP-30',
 NULL, NULL, NULL, NULL,
 true, '{"sample_data": "true"}', NOW(), NOW()),

('Steam Gift Card - S$30', 'S$30 Steam Wallet gift card. Access thousands of PC games!', 'digital', 3000, 'SGD',
 'Gaming', 'products/h.png', 100, 'STEAM-GC-30',
 NULL, NULL, NULL, NULL,
 true, '{"sample_data": "true"}', NOW(), NOW()),

-- Food & Dining
('KFC Gift Card - S$10', 'S$10 KFC Gift Card for delicious fried chicken and sides', 'gift_card', 1000, 'SGD',
 'Food & Dining', 'products/b.png', 100, 'KFC-GC-10',
 NULL, NULL, NULL, NULL,
 true, '{"sample_data": "true"}', NOW(), NOW()),

('Chi Cha San Chen - S$5', 'S$5 voucher for Chi Cha San Chen bubble tea. Treat yourself!', 'gift_card', 500, 'SGD',
 'Food & Dining', 'products/d.png', 75, 'CHICHA-GC-5',
 NULL, NULL, NULL, NULL,
 true, '{"sample_data": "true"}', NOW(), NOW()),

-- Toys
('Labubu Plush', 'Adorable Labubu plush toy from Pop Mart. Super cute and collectible!', 'physical', 3500, 'SGD',
 'Toys', 'products/f.png', 20, 'LABUBU-PLUSH-01',
 NULL, NULL, NULL, NULL,
 true, '{"sample_data": "true"}', NOW(), NOW()),

('Pikachu Plush Toy', 'Official Pokemon Pikachu plush toy - soft, cuddly, and perfect for fans!', 'physical', 2500, 'SGD',
 'Toys', 'products/g.png', 25, 'POKE-PIKA-01',
 NULL, NULL, NULL, NULL,
 true, '{"sample_data": "true"}', NOW(), NOW())
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_cents = EXCLUDED.price_cents,
  image_url = EXCLUDED.image_url,
  category = EXCLUDED.category,
  is_active = EXCLUDED.is_active,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

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