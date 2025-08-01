-- Complete Database Reset Script
-- This script drops all tables, views, functions, and triggers in reverse dependency order
-- Use with caution - this will destroy all data!

-- Drop views first (important for dependencies)
DROP VIEW IF EXISTS all_users CASCADE;
DROP VIEW IF EXISTS leaderboard CASCADE;

-- Drop tables (in dependency order - reverse creation order)
DROP TABLE IF EXISTS stripe_webhook_events CASCADE;
DROP TABLE IF EXISTS task_credit CASCADE;
DROP TABLE IF EXISTS wishlists CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS credit_transactions CASCADE;
DROP TABLE IF EXISTS user_credits CASCADE;
DROP TABLE IF EXISTS codes CASCADE;
DROP TABLE IF EXISTS user_question_answers CASCADE;
DROP TABLE IF EXISTS user_question_attempts CASCADE;
DROP TABLE IF EXISTS question_correct_answers CASCADE;
DROP TABLE IF EXISTS question_options CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS syllabus CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS class_group_constraints CASCADE;
DROP TABLE IF EXISTS family_group_constraints CASCADE;
DROP TABLE IF EXISTS group_memberships CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS parent_child CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS user_phones CASCADE;
DROP TABLE IF EXISTS user_emails CASCADE;
DROP TABLE IF EXISTS user_infos CASCADE; -- Must drop before app_users/auth.users if it references them
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS level_types CASCADE;
DROP TABLE IF EXISTS app_users CASCADE;

-- Drop functions and triggers (if needed)
DROP FUNCTION IF EXISTS prevent_cyclic_parenting CASCADE;
DROP FUNCTION IF EXISTS check_family_group_type CASCADE;
DROP FUNCTION IF EXISTS check_class_group_type CASCADE;
DROP FUNCTION IF EXISTS enforce_user_role_user_type CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;

-- Drop triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop indexes (if needed)
DROP INDEX IF EXISTS idx_user_infos_user_id CASCADE;
DROP INDEX IF EXISTS idx_user_infos_app_user_id CASCADE;
DROP INDEX IF EXISTS idx_correct_answers_question_order CASCADE;
DROP INDEX IF EXISTS idx_user_attempted_question_answers_order CASCADE;
DROP INDEX IF EXISTS idx_user_emails_primary_unique CASCADE;
DROP INDEX IF EXISTS idx_user_phones_primary_unique CASCADE;
DROP INDEX IF EXISTS idx_codes_code CASCADE;
DROP INDEX IF EXISTS idx_codes_category CASCADE;
DROP INDEX IF EXISTS idx_codes_active CASCADE;
DROP INDEX IF EXISTS idx_codes_sort_order CASCADE;
DROP INDEX IF EXISTS idx_codes_category_active CASCADE;
DROP INDEX IF EXISTS idx_user_credits_user_info_id CASCADE;
DROP INDEX IF EXISTS idx_credit_transactions_user_info_id CASCADE;
DROP INDEX IF EXISTS idx_credit_transactions_type CASCADE;
DROP INDEX IF EXISTS idx_credit_transactions_stripe_payment_intent CASCADE;
DROP INDEX IF EXISTS idx_credit_transactions_created_at CASCADE;
DROP INDEX IF EXISTS idx_products_type CASCADE;
DROP INDEX IF EXISTS idx_products_active CASCADE;
DROP INDEX IF EXISTS idx_products_category CASCADE;
DROP INDEX IF EXISTS idx_orders_user_info_id CASCADE;
DROP INDEX IF EXISTS idx_orders_order_number CASCADE;
DROP INDEX IF EXISTS idx_task_credit_parent CASCADE;
DROP INDEX IF EXISTS idx_task_credit_child CASCADE;
DROP INDEX IF EXISTS idx_stripe_webhook_events_stripe_event_id CASCADE;
DROP INDEX IF EXISTS idx_stripe_webhook_events_processed CASCADE;

-- Drop extensions (if needed - be careful with this in production)
-- DROP EXTENSION IF EXISTS pgcrypto CASCADE;

-- Reset sequences (if needed)
-- ALTER SEQUENCE IF EXISTS roles_id_seq RESTART WITH 1;

NOTICE 'Database reset complete. All tables, views, functions, and indexes have been dropped.';