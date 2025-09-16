-- ==========================================
-- EdTack Database Complete Reset Script
-- Generated: 2025-09-16T10:45:44.435Z
-- ==========================================

-- This script completely resets the database:
-- 1. Drops all tables (CASCADE)
-- 2. Creates all tables with proper structure
-- 3. Inserts all seed data

-- Begin transaction
BEGIN;

-- ==========================================
-- DROP ALL TRIGGERS
-- ==========================================

DROP TRIGGER IF EXISTS trg_user_infos_updated_at ON user_infos CASCADE;
DROP TRIGGER IF EXISTS trg_enforce_user_role_user_type ON user_roles CASCADE;
DROP TRIGGER IF EXISTS update_characters_updated_at_trigger ON characters CASCADE;

-- All triggers dropped

-- ==========================================
-- DROP ALL FUNCTIONS
-- ==========================================

DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS update_user_info_with_relations CASCADE;
DROP FUNCTION IF EXISTS enforce_user_role_user_type CASCADE;
DROP FUNCTION IF EXISTS update_characters_updated_at CASCADE;

-- All functions dropped

-- ==========================================
-- DROP ALL TABLES (CASCADE for dependencies)
-- ==========================================

DROP TABLE IF EXISTS user_tasks_chapters CASCADE;
DROP TABLE IF EXISTS message_feedback CASCADE;
DROP TABLE IF EXISTS task_threads CASCADE;
DROP TABLE IF EXISTS thread_messages CASCADE;
DROP TABLE IF EXISTS threads CASCADE;
DROP TABLE IF EXISTS checkpoints CASCADE;
DROP TABLE IF EXISTS stripe_webhook_events CASCADE;
DROP TABLE IF EXISTS token_history CASCADE;
DROP TABLE IF EXISTS characters CASCADE;
DROP TABLE IF EXISTS credit_transactions CASCADE;
DROP TABLE IF EXISTS user_tasks CASCADE;
DROP TABLE IF EXISTS wishlists CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS user_question_answers CASCADE;
DROP TABLE IF EXISTS user_question_attempts CASCADE;
DROP TABLE IF EXISTS question_correct_answers CASCADE;
DROP TABLE IF EXISTS question_options CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS syllabus CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS user_credits CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS user_infos CASCADE;
DROP TABLE IF EXISTS curriculum_subjects CASCADE;
DROP TABLE IF EXISTS chapters CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS codes CASCADE;
DROP TABLE IF EXISTS syllabus_types CASCADE;
DROP TABLE IF EXISTS level_types CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- All tables dropped

-- ==========================================
-- CREATE ALL TABLES
-- ==========================================

-- From: roles.sql
-- Roles Table
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  role_name TEXT NOT NULL CHECK (role_name IN ('ADMIN', 'PARENT', 'TEACHER', 'STUDENT'))
);

-- From: level_types.sql
-- Level Types Table
CREATE TABLE level_types (
  level_type VARCHAR(50) PRIMARY KEY,
  description VARCHAR(255) DEFAULT NULL
);

-- From: syllabus_types.sql
-- Syllabus Types Table
CREATE TABLE syllabus_types (
  syllabus_type VARCHAR(50) PRIMARY KEY,
  description VARCHAR(255) DEFAULT NULL
);

-- From: codes.sql
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

-- From: subjects.sql
-- Subject Table
-- Represents the subject structure (e.g. Mathematics, Science)
CREATE TABLE subjects (
  name VARCHAR(100) PRIMARY KEY,       -- e.g. 'MY_BASIC_MATH'
  subject_name VARCHAR(100) NOT NULL,  -- e.g. 'Mathematics'
  display_name VARCHAR(100) NOT NULL,  -- e.g. 'Malaysia PSLE Standard Math'
  description TEXT DEFAULT NULL,
  country_code VARCHAR(2) DEFAULT 'SG'
);

-- From: chapters.sql
-- Chapter Table
-- Represents the hierarchical educational content structure (main topics, sub-strands, sub-topics)
-- Recursive structure with parent_id referencing the same table
CREATE TABLE chapters (
  name VARCHAR(100) PRIMARY KEY,
  display_name VARCHAR(100) NOT NULL,
  subject_id VARCHAR(100) NOT NULL REFERENCES subjects(name) ON DELETE CASCADE,
  parent_id VARCHAR(100) REFERENCES chapters(name) ON DELETE CASCADE, -- NULL for top-level
  level INT NOT NULL,
  description TEXT DEFAULT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0, -- For ordering within chapters
  CONSTRAINT unique_chapter_per_subject UNIQUE (subject_id, name) -- Ensure unique chapter names within the same subject
);

-- From: curriculum_subjects.sql
-- Curriculum Subjects Table
-- Junction table linking level_types, syllabus_types, and subjects
-- Defines which subjects are available for each level/syllabus combination
CREATE TABLE curriculum_subjects (
    level_type VARCHAR(50) REFERENCES level_types(level_type),
    syllabus_type VARCHAR(50) REFERENCES syllabus_types(syllabus_type),
    subject VARCHAR(100) REFERENCES subjects(name),
    CONSTRAINT pk_curriculum_subjects PRIMARY KEY (level_type, syllabus_type, subject)
);

-- From: user_infos.sql
-- User Infos Table (Centralized Profile Data, links to auth.users only)
CREATE TABLE user_infos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE, -- Link to Supabase Auth user
  email VARCHAR(255) UNIQUE NOT NULL, -- Email is unique across all profiles
  contact_number VARCHAR(20) DEFAULT NULL, -- Contact number can be null
  first_name VARCHAR(100) DEFAULT NULL,
  last_name VARCHAR(100) DEFAULT NULL,
  gender VARCHAR(10) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  country_code VARCHAR(2) DEFAULT 'SG',
  postal_code VARCHAR(10) DEFAULT NULL,
  date_of_birth DATE DEFAULT NULL,
  level_type VARCHAR(50) REFERENCES level_types(level_type) ON DELETE CASCADE,
  syllabus_type VARCHAR(50) REFERENCES syllabus_types(syllabus_type) ON DELETE CASCADE,
  profile_picture_url VARCHAR(255) DEFAULT NULL,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  payment_customer_id VARCHAR(100) DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call update_updated_at_column on user_infos table
CREATE TRIGGER trg_user_infos_updated_at
BEFORE UPDATE ON user_infos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for user_infos for faster lookups
CREATE UNIQUE INDEX idx_user_infos_user_id ON user_infos(user_id);
CREATE UNIQUE INDEX idx_user_infos_email ON user_infos(email);

-- Function to update user_info with relations
-- This function updates user_info and handles related data like roles and credits
CREATE OR REPLACE FUNCTION public.update_user_info_with_relations(
  p_user_info_id UUID,
  p_user_id UUID,
  p_first_name TEXT,
  p_last_name TEXT,
  p_payment_customer_id TEXT,
  p_is_active BOOLEAN,
  p_onboarding_completed BOOLEAN,
  p_role_name TEXT,
  p_email TEXT,
  p_level_type TEXT DEFAULT NULL,
  p_syllabus_type TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_user_info RECORD;
  v_role_id INT;
  v_role_name TEXT;
  v_result JSONB;
BEGIN
  RAISE LOG '[update_user_info_with_relations] Starting for user_info_id: %', p_user_info_id;

  -- Insert or update user_infos record
  INSERT INTO public.user_infos (
    id, email, user_id, first_name, last_name, level_type, syllabus_type,
    payment_customer_id, is_active, onboarding_completed, created_at, updated_at
  ) VALUES (
    p_user_info_id,
    p_email,
    p_user_id,
    p_first_name,
    p_last_name,
    p_level_type,
    p_syllabus_type,
    p_payment_customer_id,
    p_is_active,
    p_onboarding_completed,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    level_type = EXCLUDED.level_type,
    syllabus_type = EXCLUDED.syllabus_type,
    payment_customer_id = EXCLUDED.payment_customer_id,
    is_active = EXCLUDED.is_active,
    onboarding_completed = EXCLUDED.onboarding_completed,
    updated_at = NOW()
  RETURNING * INTO v_user_info;


  RAISE LOG '[update_user_info_with_relations] Updated user_infos for: %', p_user_info_id;

  -- Handle role assignment if provided
  IF p_role_name IS NOT NULL THEN
    -- Delete existing roles
    DELETE FROM public.user_roles WHERE user_info_id = p_user_info_id;
    RAISE LOG '[update_user_info_with_relations] Deleted existing roles for: %', p_user_info_id;

    -- Insert new role
    SELECT id, role_name INTO v_role_id, v_role_name FROM public.roles WHERE role_name = p_role_name;

    IF v_role_id IS NULL THEN
      RAISE EXCEPTION '[update_user_info_with_relations] Invalid role name: %', p_role_name;
    END IF;

    INSERT INTO public.user_roles (user_info_id, role_id, role_name)
    VALUES (p_user_info_id, v_role_id, v_role_name);
    
    RAISE LOG '[update_user_info_with_relations] Inserted role % (%)', p_role_name, v_role_id;
  END IF;

  -- Create or update user credits record
  INSERT INTO public.user_credits (user_info_id, credit, updated_at)
  VALUES (p_user_info_id, 0, NOW())
  ON CONFLICT (user_info_id) DO UPDATE SET
    credit = 0,
    updated_at = NOW();
  RAISE LOG '[update_user_info_with_relations] User credits updated for: %', p_user_info_id;

  -- Return updated user info with relations
  SELECT jsonb_build_object(
    'user_info', row_to_json(v_user_info),
    'success', true,
    'message', 'User info updated successfully'
  ) INTO v_result;

  RAISE LOG '[update_user_info_with_relations] Completed successfully for: %', p_user_info_id;
  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION '[update_user_info_with_relations] Failed: %', SQLERRM;
END;
$$;


-- From: user_roles.sql
-- User Roles Table (Many-to-Many, now links to user_infos)
CREATE TABLE user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_info_id uuid NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE,
  role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL,
  UNIQUE (user_info_id, role_id) -- A user_info can only have one of each role
);

-- Trigger function to enforce user role rules based on user_infos links
-- Ensures all users must be linked to auth.users (no app_users allowed)
CREATE OR REPLACE FUNCTION enforce_user_role_user_type()
RETURNS TRIGGER AS $$
DECLARE
  role_name_val TEXT;
  linked_user_id UUID;
BEGIN
  RAISE LOG '[enforce_user_role_user_type] user_info_id: %, role_id: %', NEW.user_info_id, NEW.role_id;

  -- Check if role_id is NULL first
  IF NEW.role_id IS NULL THEN
    RAISE EXCEPTION '[enforce_user_role_user_type] role_id is NULL';
  END IF;

  -- Check if role exists - EXPLICITLY use public schema
  SELECT role_name INTO role_name_val FROM public.roles WHERE id = NEW.role_id;

  IF role_name_val IS NULL THEN
    RAISE EXCEPTION '[enforce_user_role_user_type] Role with id % not found in roles table. Available roles: %',
      NEW.role_id,
      (SELECT string_agg(id::text || ':' || role_name, ', ') FROM public.roles);
  END IF;

  RAISE LOG 'Processing role: %', role_name_val;

  -- Fetch the linked auth.users.id from user_infos
  SELECT user_id INTO linked_user_id
  FROM public.user_infos WHERE id = NEW.user_info_id;

  RAISE LOG 'Getting user_id: %', linked_user_id;

  -- All users must be linked to auth.users
  IF linked_user_id IS NULL THEN
    RAISE EXCEPTION '[enforce_user_role_user_type] All users must be linked to auth.users (user_id required)';
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION '[enforce_user_role_user_type] Failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enforce_user_role_user_type
BEFORE INSERT OR UPDATE ON user_roles
FOR EACH ROW EXECUTE FUNCTION enforce_user_role_user_type();

-- From: user_credits.sql
-- User Credits table for internal credit tracking
CREATE TABLE IF NOT EXISTS user_credits (
  user_info_id UUID NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE,
  credit INTEGER NOT NULL DEFAULT 0, -- Credit balance in cents
  reserved_credit INTEGER DEFAULT 0, -- Credits reserved for pending orders
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_info_id)
);

-- Add constraint to ensure reserved credits don't exceed total credits
ALTER TABLE user_credits 
ADD CONSTRAINT chk_reserved_not_exceed_total 
CHECK (reserved_credit <= credit);

-- Add indexes for user_credits
CREATE INDEX IF NOT EXISTS idx_user_credits_user_info_id ON user_credits(user_info_id);

-- From: groups.sql
CREATE TABLE groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  description text,
  group_type text,
  is_active boolean DEFAULT true,
  created_by uuid NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- From: group_members.sql
CREATE TABLE group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_info_id uuid NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE,
  status text NOT NULL,
  invited_by uuid REFERENCES user_infos(id) ON DELETE SET NULL,
  joined_at timestamp with time zone DEFAULT now(),
  invited_at timestamp with time zone DEFAULT now(),
  is_creator boolean DEFAULT false,
  UNIQUE (group_id, user_info_id)
);

CREATE INDEX idx_group_members_group_id ON group_members(group_id);

-- From: syllabus.sql
-- Syllabus Table
-- Represents the syllabus structure (main topics, sub-strands, sub-topics)
-- Recursive structure with parent_id referencing the same table
CREATE TABLE syllabus (
  name VARCHAR(100) PRIMARY KEY,
  display_name VARCHAR(100) NOT NULL,
  subject_id VARCHAR(100) NOT NULL REFERENCES subjects(name) ON DELETE CASCADE,
  parent_id VARCHAR(100) REFERENCES syllabus(name) ON DELETE CASCADE, -- NULL for top-level
  level INT NOT NULL,
  description TEXT DEFAULT NULL
);

-- From: questions.sql
-- Questions Table
CREATE TABLE questions (
  id uuid PRIMARY KEY,
  chapter_id VARCHAR(100) NOT NULL REFERENCES chapters(name) ON DELETE CASCADE, -- UPDATED TO CHAPTER
  parent_question_id uuid REFERENCES questions(id) ON DELETE CASCADE, -- NULL for top-level questions
  subquestion_order INT DEFAULT NULL, -- Order among siblings (sub-parts)
  part_label VARCHAR(20) DEFAULT NULL, -- e.g., 'A)', 'ii)', '1)'
  type TEXT NOT NULL CHECK (type IN ('parent', 'mcq', 'open', 'boolean', 'draw', 'fill')),
  title VARCHAR(255) NOT NULL,
  question TEXT NOT NULL,
  explanation TEXT DEFAULT NULL,
  question_image_url VARCHAR(255) DEFAULT NULL, -- S3 url temp
  explanation_image_url VARCHAR(255) DEFAULT NULL, -- S3 url temp
  source_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Time of question source to indicate freshness
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  source_name TEXT NOT NULL
);

-- From: question_options.sql
-- Options Table
CREATE TABLE question_options (
  id uuid PRIMARY KEY,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_text VARCHAR(255) DEFAULT NULL,
  image_url VARCHAR(255) DEFAULT NULL,
  CHECK (
    option_text IS NOT NULL OR image_url IS NOT NULL
  )
);

-- From: question_correct_answers.sql
-- Correct Answers Table
CREATE TABLE question_correct_answers (
  id uuid PRIMARY KEY,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_id uuid REFERENCES question_options(id) ON DELETE CASCADE,
  answer_text TEXT DEFAULT NULL,
  answer_boolean BOOLEAN DEFAULT NULL,
  answer_draw_file VARCHAR(255) DEFAULT NULL,
  image_url VARCHAR(255) DEFAULT NULL, -- S3 url temp
  order_index INT NOT NULL, -- Order of this option in the answer used to sort
  CHECK (
    option_id IS NOT NULL
    OR answer_text IS NOT NULL
    OR answer_boolean IS NOT NULL
    OR answer_draw_file IS NOT NULL
  )
);

-- Index for performance as answers has order
CREATE INDEX idx_correct_answers_question_order
ON question_correct_answers (question_id, order_index);

-- From: user_question_attempts.sql
-- Stores the history of all user answers for all questions (all attempts) - now links to user_infos
CREATE TABLE user_question_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_info_id uuid NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  attempt_number INT DEFAULT 1,
  submitted_at TIMESTAMP NOT NULL,
  duration_seconds INT NOT NULL,
  score DECIMAL(5, 2) DEFAULT NULL,
  is_correct BOOLEAN DEFAULT NULL
);

-- From: user_question_answers.sql
-- Stores the history of all user answers for all questions (all attempts)
CREATE TABLE user_question_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_question_attempts_id uuid NOT NULL REFERENCES user_question_attempts(id) ON DELETE CASCADE,
  option_id uuid NOT NULL REFERENCES question_options(id) ON DELETE CASCADE,
  option_text VARCHAR(255) DEFAULT NULL,   -- snapshot
  option_image VARCHAR(255) DEFAULT NULL,  -- snapshot
  answer_text TEXT DEFAULT NULL,
  answer_boolean BOOLEAN DEFAULT NULL,
  answer_draw_file VARCHAR(255) DEFAULT NULL,
  order_index INT NOT NULL -- Order of this option in the answer used to sort
);

-- Index for performance as answers has order
CREATE INDEX idx_user_attempted_question_answers_order
ON user_question_answers (user_question_attempts_id, order_index);

-- From: products.sql
-- Products table for storefront catalog
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  product_type TEXT NOT NULL,
  price_cents INTEGER NOT NULL, -- Price in SGD cents (100 = $1.00 SGD)
  currency TEXT DEFAULT 'SGD',
  image_url TEXT, -- Product image URL
  category TEXT,
  stock_count INTEGER NOT NULL DEFAULT 0, -- Available stock count
  sku TEXT UNIQUE, -- Stock Keeping Unit - use product-specific unique identifier
  -- Discount fields
  discount_percentage DECIMAL(5,2), -- Percentage discount (0.00 to 100.00)
  discount_amount_cents INTEGER, -- Fixed discount amount in cents
  discount_start_date TIMESTAMPTZ, -- When discount becomes active
  discount_end_date TIMESTAMPTZ, -- When discount expires
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB, -- Additional product data (ratings, reviews, features, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_products_type ON products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- Grant permissions to service role for webhook processing
GRANT ALL ON products TO service_role;

-- From: orders.sql
-- Orders table (replaces user_purchases)
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL, -- Human-readable order number
  user_info_id UUID NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE,
  status_code TEXT NOT NULL,
  total_amount_cents INTEGER NOT NULL, -- Total cost in SGD cents
  currency TEXT, -- Removed default
  payment_method TEXT, -- Removed default
  stripe_balance_transaction_id TEXT, -- Reference to Stripe transaction
  notes TEXT,
  -- Status timestamps for tracking
  pending_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_user_info_id ON orders(user_info_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Grant permissions to service role for webhook processing
GRANT ALL ON orders TO service_role;

-- From: order_items.sql
-- Order Items table for individual products in orders
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  status_code TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_cents INTEGER NOT NULL, -- Price at time of purchase
  total_price_cents INTEGER NOT NULL, -- unit_price_cents * quantity
  -- External fulfillment tracking fields (moved from orders table)
  tracking_number TEXT, -- Tracking number from external fulfillment provider
  external_status TEXT, -- Status from external fulfillment system
  fulfillment_provider TEXT, -- Name of external fulfillment provider
  fulfillment_webhook_data JSONB, -- Data received from fulfillment webhooks
  shipped_at TIMESTAMPTZ, -- When this item was shipped
  delivered_at TIMESTAMPTZ, -- When this item was delivered
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grant permissions to service role for webhook processing
GRANT ALL ON order_items TO service_role;

-- From: wishlists.sql
-- Wishlist table for user wishlist management
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

-- From: user_tasks.sql
-- User Tasks table for task-based credit earning
CREATE TABLE IF NOT EXISTS user_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_user_info_id UUID NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE,
  assignee_user_info_id UUID NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject VARCHAR(100) NOT NULL REFERENCES subjects(name) ON DELETE CASCADE,
  lesson_generation_type TEXT NOT NULL,
  credit INTEGER NOT NULL DEFAULT 0, -- Credit reward in cents
  questions_per_quiz INTEGER DEFAULT 10, -- Number of questions per quiz (for quiz tasks)
  required_score INTEGER DEFAULT 70, -- Required score percentage (0-100) to earn credit
  recurrence_frequency TEXT, -- ONE_OFF, DAILY, WEEKLY, MONTHLY - controls task scheduling
  due_date TIMESTAMPTZ,
  status TEXT NOT NULL, 
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for user_tasks
CREATE INDEX IF NOT EXISTS idx_user_tasks_creator ON user_tasks(creator_user_info_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_assignee ON user_tasks(assignee_user_info_id);

-- Add constraint to ensure creator and assignee are different
ALTER TABLE user_tasks ADD CONSTRAINT chk_different_users 
  CHECK (creator_user_info_id != assignee_user_info_id);

-- From: credit_transactions.sql
-- Credit Transactions table for credit operations
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_info_id UUID NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL,
  currency TEXT NOT NULL,
  amount INTEGER NOT NULL, -- Credits amount (can be negative for usage/transfers out)
  stripe_payment_intent_id TEXT, -- For purchases from Stripe
  stripe_checkout_session_id TEXT, -- For checkout sessions
  from_user_info_id UUID REFERENCES user_infos(id), -- For transfers
  to_user_info_id UUID REFERENCES user_infos(id), -- For transfers
  description TEXT,
  is_internal BOOLEAN DEFAULT FALSE, -- Flag for internal credit system vs external Stripe
  metadata JSONB, -- Additional transaction data
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_info_id ON credit_transactions(user_info_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_stripe_payment_intent ON credit_transactions(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);


-- Credit transactions: Users can view their own transactions
CREATE POLICY "Users can view own credit transactions" ON credit_transactions
  FOR SELECT USING (user_info_id IN (
    SELECT id FROM user_infos WHERE user_id = auth.uid()
  ));

-- Grant permissions to service role for webhook processing
GRANT ALL ON credit_transactions TO service_role;

-- From: characters.sql
-- Characters Table
CREATE TABLE characters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    subject VARCHAR(100) NOT NULL DEFAULT 'GENERAL',
    description TEXT,
    image_url TEXT,
    personality_prompt TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for active characters
CREATE INDEX idx_characters_active ON characters(is_active) WHERE is_active = true;

-- Create index for display order
CREATE INDEX idx_characters_display_order ON characters(display_order);

-- Create index for slug
CREATE INDEX idx_characters_slug ON characters(slug);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_characters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_characters_updated_at_trigger
BEFORE UPDATE ON characters
FOR EACH ROW
EXECUTE FUNCTION update_characters_updated_at();

-- From: token_history.sql
-- Token History Table (Track AI token usage by users)
CREATE TABLE token_history (
  id SERIAL PRIMARY KEY,
  user_infos_id uuid REFERENCES user_infos(id) ON DELETE CASCADE, -- Reference to user_infos table but optional for now 
  thread_id VARCHAR(255) NOT NULL,
  module_name VARCHAR(100) NOT NULL,
  query TEXT,
  token_count INTEGER NOT NULL,
  query_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Optional fields for detailed tracking
  provider VARCHAR(50),
  model VARCHAR(100),
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  response_time_ms INTEGER
);

-- Indexes for token_history for faster lookups
CREATE INDEX idx_token_history_user_infos_id ON token_history(user_infos_id);
CREATE INDEX idx_token_history_thread_id ON token_history(thread_id);

-- From: stripe_webhook_events.sql
-- Stripe Webhook Events table for idempotency
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_stripe_event_id ON stripe_webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_processed ON stripe_webhook_events(processed);

-- Webhook events: Only accessible by service role
CREATE POLICY "Service role can manage webhook events" ON stripe_webhook_events
  FOR ALL USING (auth.role() = 'service_role');

-- Grant permissions to service role for webhook processing
GRANT ALL ON stripe_webhook_events TO service_role;

-- From: checkpointer_tables.sql
-- LangGraph Checkpointer Tables for AsyncPostgresSaver
-- These tables store conversation state and checkpoints for AI conversations
-- Based on LangGraph requirements for persistent state management

-- 1. Main checkpoints table (stores conversation state)
CREATE TABLE IF NOT EXISTS checkpoints (
    thread_id TEXT NOT NULL,
    checkpoint_ns TEXT NOT NULL DEFAULT '',
    checkpoint_id TEXT NOT NULL,
    parent_checkpoint_id TEXT,
    type TEXT,
    checkpoint JSONB NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id)
);

-- 2. Checkpoint writes table (tracks state changes)
CREATE TABLE IF NOT EXISTS checkpoint_writes (
    thread_id TEXT NOT NULL,
    checkpoint_ns TEXT NOT NULL DEFAULT '',
    checkpoint_id TEXT NOT NULL,
    task_id TEXT NOT NULL,
    idx INTEGER NOT NULL,
    channel TEXT NOT NULL,
    type TEXT,
    value JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id, task_id, idx)
);

-- 3. Checkpoint blobs table (large data storage)
CREATE TABLE IF NOT EXISTS checkpoint_blobs (
    thread_id TEXT NOT NULL,
    checkpoint_ns TEXT NOT NULL DEFAULT '',
    channel TEXT NOT NULL,
    version TEXT NOT NULL,
    type TEXT NOT NULL,
    blob BYTEA,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (thread_id, checkpoint_ns, channel, version)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_checkpoints_thread_id ON checkpoints(thread_id);
CREATE INDEX IF NOT EXISTS idx_checkpoints_created_at ON checkpoints(created_at);
CREATE INDEX IF NOT EXISTS idx_checkpoint_writes_thread_id ON checkpoint_writes(thread_id);
CREATE INDEX IF NOT EXISTS idx_checkpoint_blobs_thread_id ON checkpoint_blobs(thread_id);

-- From: functions.sql
-- Database Functions and Extensions

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Note: The update_updated_at_column function is already created in 004_user_infos.sql
-- This file is reserved for any additional shared functions that might be needed in the future

-- From: threads.sql
CREATE TABLE threads (
                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              user_infos_id UUID NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE, -- who owns this thread
                              title TEXT,
                              subject VARCHAR(100), -- subject for the thread to load correct character
                              created_at TIMESTAMP DEFAULT NOW(),
                              updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_threads_user_infos_id ON threads(user_infos_id);


-- From: thread_messages.sql
CREATE TABLE thread_messages (
                               id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                               thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
                               sender UUID DEFAULT NULL REFERENCES user_infos(id) ON DELETE CASCADE,
                               type VARCHAR(20) NOT NULL,
                               content TEXT NOT NULL,
                               created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_thread_messages_thread_id ON thread_messages(thread_id);
CREATE INDEX idx_thread_messages_sender ON thread_messages(sender);


-- From: task_threads.sql
-- Task Threads table for tracking individual task instances
-- This table implements a 1:many relationship with user_tasks, where:
-- - user_tasks acts as a template/definition for recurring tasks
-- - task_threads represents individual instances that users actually work on
-- 
-- This design enables:
-- 1. Proper tracking of recurring task instances with individual due dates
-- 2. Separation of task definition (user_tasks) from execution (task_threads)  
-- 3. Integration with chat system for content generation and interaction
-- 4. Granular status tracking for each task instance

CREATE TABLE IF NOT EXISTS task_threads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_task_id UUID NOT NULL REFERENCES user_tasks(id) ON DELETE CASCADE,
  thread_id UUID UNIQUE NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  chapter VARCHAR(100) NOT NULL REFERENCES chapters(name) ON DELETE CASCADE,
  due_date TIMESTAMPTZ NOT NULL,
  init_prompt JSONB,   -- Example: {"subject": "math", "difficulty": "grade_5", "questions": 10}
  generated_content JSONB,   -- TODO: currently not in use, will be generated from the thread on init
  status TEXT NOT NULL DEFAULT 'OPEN', -- OPEN, COMPLETED, EXPIRED
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_task_threads_user_task ON task_threads(user_task_id);
CREATE INDEX IF NOT EXISTS idx_task_threads_thread ON task_threads(thread_id);
CREATE INDEX IF NOT EXISTS idx_task_threads_status ON task_threads(status);

-- Composite index for recurring task cron job queries
-- Optimizes finding threads that need status updates or new instances created
CREATE INDEX IF NOT EXISTS idx_task_threads_status_due_date ON task_threads(status, due_date);

-- Add constraint to ensure valid status values
ALTER TABLE task_threads 
ADD CONSTRAINT chk_task_threads_status 
CHECK (status IN ('OPEN', 'COMPLETED', 'EXPIRED'));

-- Add constraint to ensure due_date is not in the past when creating
-- (This will be enforced at the application level for flexibility)

-- From: message_feedback.sql
CREATE TABLE message_feedback (
                               id BIGSERIAL PRIMARY KEY,
                               message_id UUID NOT NULL REFERENCES thread_messages(id) ON DELETE CASCADE,
                               user_infos_id UUID NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE, -- who gave feedback (using consistent UUID type)
                               feedback_type VARCHAR(10) NOT NULL CHECK (feedback_type IN ('like', 'dislike')),
                               category VARCHAR(50), -- optional category like 'accuracy', 'clarity', etc.
                               feedback_text TEXT, -- optional detailed feedback text
                               created_at TIMESTAMP DEFAULT NOW(),
                               UNIQUE (message_id, user_infos_id) -- one feedback per user per message
);

CREATE INDEX idx_message_feedback_message_id ON message_feedback(message_id);
CREATE INDEX idx_message_feedback_user_infos_id ON message_feedback(user_infos_id);


-- From: user_tasks_chapters.sql
-- User Tasks Chapters Table
-- Junction table linking user_tasks to chapters for multi-chapter task assignments
-- This allows parents to assign tasks covering multiple chapters within a subject
CREATE TABLE IF NOT EXISTS user_tasks_chapters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_task_id UUID NOT NULL REFERENCES user_tasks(id) ON DELETE CASCADE,
  chapter_name VARCHAR(100) NOT NULL REFERENCES chapters(name) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure no duplicate chapter assignments per task
  CONSTRAINT unique_task_chapter UNIQUE(user_task_id, chapter_name)
);

-- Performance indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_user_tasks_chapters_task ON user_tasks_chapters(user_task_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_chapters_chapter ON user_tasks_chapters(chapter_name);

-- Composite index for querying task chapters together
CREATE INDEX IF NOT EXISTS idx_user_tasks_chapters_task_chapter ON user_tasks_chapters(user_task_id, chapter_name);

-- ==========================================
-- SEED DATA
-- ==========================================

-- Seed data from: all_seeds.sql
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

-- Seed data from: education_data.sql
INSERT INTO level_types (level_type, description) VALUES
('PRIMARY_1', 'Primary 1'),
('PRIMARY_2', 'Primary 2'),
('PRIMARY_3', 'Primary 3'),
('PRIMARY_4', 'Primary 4'),
('PRIMARY_5', 'Primary 5'),
('PRIMARY_6', 'Primary 6'),
('SECONDARY_1', 'Secondary 1'),
('SECONDARY_2', 'Secondary 2'),
('SECONDARY_3', 'Secondary 3'),
('SECONDARY_4', 'Secondary 4'),
('SECONDARY_5', 'Secondary 5'),
('JUNIOR_COLLEGE_1', 'Junior College 1'),
('JUNIOR_COLLEGE_2', 'Junior College 2');

INSERT INTO syllabus_types (syllabus_type, description) VALUES
('SG_PSLE', 'Singapore PSLE'),
('SG_O_LEVEL', 'Singapore O Level'),
('SG_N_LEVEL', 'Singapore N Level'),
('SG_A_LEVEL', 'Singapore A Level');
-- ('MY_PSLE', 'Malaysia PSLE'),
-- ('MY_SPM', 'Malaysia SPM'),
-- ('MY_STPM', 'Malaysia STPM'),
-- ('US_COMMON_CORE', 'US Common Core'),
-- ('UK_NATIONAL_CURRICULUM', 'UK National Curriculum');


INSERT INTO subjects (name, subject_name, display_name, description, country_code) VALUES
('o_level_singapore_mathematics', 'Mathematics', 'Singapore O Level Mathematics', 'Mathematics for Singapore O Level', 'SG'),
('o_level_singapore_add_math', 'Additional_Mathematics', 'Singapore O Level Additional Mathematics', 'Additional Mathematics for Singapore O Level', 'SG'),
('n_level_singapore_add_math', 'Mathematics', 'Singapore O Level Mathematics', 'Mathematics for Singapore O Level', 'SG'),
('lower_secondary_singapore_mathemathics', 'Mathematics', 'Singapore Lower Secondary Mathematics', 'Mathematics for Singapore Lower Secondary shared for o_level and n_level syllabus types', 'SG'),
('o_level_singapore_biology', 'Biology', 'Singapore O Level Biology', 'Biology for Singapore O Level', 'SG'),
('n_level_singapore_biology', 'Biology', 'Singapore N Level Biology', 'Biology for Singapore N Level Academic', 'SG'),
('o_level_singapore_chemistry', 'Chemistry', 'Singapore O Level Chemistry', 'Chemistry for Singapore O Level', 'SG'),
('o_level_singapore_physics', 'Physics', 'Singapore O Level Physics', 'Physics for Singapore O Level', 'SG'),
('o_level_singapore_english', 'English', 'Singapore O Level English', 'English for Singapore O Level', 'SG'),
('o_level_singapore_geography', 'Geography', 'Singapore O Level Geography', 'Geography for Singapore O Level', 'SG'),
('o_level_singapore_history', 'History', 'Singapore O Level History', 'History for Singapore O Level', 'SG'),
('o_level_singapore_social_studies', 'Social_Studies', 'Singapore O Level Social Studies', 'Social Studies for Singapore O Level', 'SG');

-- Curriculum Subjects Data for O-Level and N-Level
INSERT INTO curriculum_subjects (level_type, syllabus_type, subject) VALUES
-- O-Level Mathematics (typically for Secondary 3 and 4)
('SECONDARY_3', 'SG_O_LEVEL', 'o_level_singapore_mathematics'),
('SECONDARY_4', 'SG_O_LEVEL', 'o_level_singapore_mathematics'),
-- O-Level Additional Mathematics (typically for Secondary 3 and 4)
('SECONDARY_3', 'SG_O_LEVEL', 'o_level_singapore_add_math'),
('SECONDARY_4', 'SG_O_LEVEL', 'o_level_singapore_add_math'),
-- O-Level Biology (typically for Secondary 3 and 4)
('SECONDARY_3', 'SG_O_LEVEL', 'o_level_singapore_biology'),
('SECONDARY_4', 'SG_O_LEVEL', 'o_level_singapore_biology'),
-- O-Level Chemistry (typically for Secondary 3 and 4)
('SECONDARY_3', 'SG_O_LEVEL', 'o_level_singapore_chemistry'),
('SECONDARY_4', 'SG_O_LEVEL', 'o_level_singapore_chemistry'),
-- O-Level Physics (typically for Secondary 3 and 4)
('SECONDARY_3', 'SG_O_LEVEL', 'o_level_singapore_physics'),
('SECONDARY_4', 'SG_O_LEVEL', 'o_level_singapore_physics'),
-- O-Level English (typically for Secondary 3 and 4)
('SECONDARY_3', 'SG_O_LEVEL', 'o_level_singapore_english'),
('SECONDARY_4', 'SG_O_LEVEL', 'o_level_singapore_english'),
-- O-Level Geography (typically for Secondary 3 and 4)
('SECONDARY_3', 'SG_O_LEVEL', 'o_level_singapore_geography'),
('SECONDARY_4', 'SG_O_LEVEL', 'o_level_singapore_geography'),
-- O-Level History (typically for Secondary 3 and 4)
('SECONDARY_3', 'SG_O_LEVEL', 'o_level_singapore_history'),
('SECONDARY_4', 'SG_O_LEVEL', 'o_level_singapore_history'),
-- O-Level Social Studies (typically for Secondary 3 and 4)
('SECONDARY_3', 'SG_O_LEVEL', 'o_level_singapore_social_studies'),
('SECONDARY_4', 'SG_O_LEVEL', 'o_level_singapore_social_studies'),
-- N-Level Biology (typically for Secondary 3, 4, and 5)
('SECONDARY_3', 'SG_N_LEVEL', 'n_level_singapore_biology'),
('SECONDARY_4', 'SG_N_LEVEL', 'n_level_singapore_biology'),
('SECONDARY_5', 'SG_N_LEVEL', 'n_level_singapore_biology');

-- O-Level Biology Chapters
INSERT INTO chapters (name, display_name, subject_id, level, description, sort_order) VALUES
('o_level_singapore_biology_00_introduction', 'Introduction', 'o_level_singapore_biology', 1, 'Introduction to Biology', 0),
('o_level_singapore_biology_chapter_01_cell_structure_and_organization', 'Cell Structure and Organization', 'o_level_singapore_biology', 1, 'Understanding the basic unit of life - cells, their structures and organization', 1),
('o_level_singapore_biology_chapter_02_movement_of_substances', 'Movement of Substances', 'o_level_singapore_biology', 1, 'How substances move in and out of cells through diffusion, osmosis and active transport', 2),
('o_level_singapore_biology_chapter_03_biological_molecules', 'Biological Molecules', 'o_level_singapore_biology', 1, 'Study of carbohydrates, proteins, lipids and nucleic acids', 3),
('o_level_singapore_biology_chapter_04_enzymes', 'Enzymes', 'o_level_singapore_biology', 1, 'Biological catalysts and their role in metabolic processes', 4),
('o_level_singapore_biology_chapter_05_nutrition_in_humans', 'Nutrition in Humans', 'o_level_singapore_biology', 1, 'Human digestive system and the process of digestion', 5),
('o_level_singapore_biology_chapter_06_transport_in_humans', 'Transport in Humans', 'o_level_singapore_biology', 1, 'Circulatory system, blood and heart structure and function', 6),
('o_level_singapore_biology_chapter_07_respiration_in_humans', 'Respiration in Humans', 'o_level_singapore_biology', 1, 'Aerobic and anaerobic respiration, gas exchange in lungs', 7),
('o_level_singapore_biology_chapter_08_excretion_in_humans', 'Excretion in Humans', 'o_level_singapore_biology', 1, 'Removal of metabolic waste products, kidney structure and function', 8),
('o_level_singapore_biology_chapter_09_homeostasis_and_hormonal_control', 'Homeostasis and Hormonal Control', 'o_level_singapore_biology', 1, 'Maintaining internal environment, endocrine system and hormones', 9),
('o_level_singapore_biology_chapter_10_the_nervous_system_and_coordination', 'The Nervous System and Coordination', 'o_level_singapore_biology', 1, 'Structure and function of nervous system, reflexes and voluntary actions', 10),
('o_level_singapore_biology_chapter_11_infectious_diseases_in_humans', 'Infectious Diseases in Humans', 'o_level_singapore_biology', 1, 'Pathogens, transmission, prevention and immunity', 11),
('o_level_singapore_biology_chapter_12_the_ecosystem_and_human_impact', 'The Ecosystem and Human Impact', 'o_level_singapore_biology', 1, 'Food chains, nutrient cycles and environmental conservation', 12),
('o_level_singapore_biology_chapter_13_molecular_genetics', 'Molecular Genetics', 'o_level_singapore_biology', 1, 'DNA structure, protein synthesis and genetic engineering', 13),
('o_level_singapore_biology_chapter_14_modes_of_reproduction', 'Modes of Reproduction', 'o_level_singapore_biology', 1, 'Asexual and sexual reproduction in organisms', 14),
('o_level_singapore_biology_chapter_15_reproduction_in_plants', 'Reproduction in Plants', 'o_level_singapore_biology', 1, 'Flower structure, pollination, fertilization and seed dispersal', 15),
('o_level_singapore_biology_chapter_16_reproduction_in_humans', 'Reproduction in Humans', 'o_level_singapore_biology', 1, 'Human reproductive systems, fertilization and development', 16),
('o_level_singapore_biology_chapter_17_inheritance', 'Inheritance', 'o_level_singapore_biology', 1, 'Mendelian genetics, variation and natural selection', 17);
-- O-Level Mathematics Chapters
INSERT INTO chapters (name, display_name, subject_id, level, description, sort_order) VALUES
('o_level_singapore_mathematics_00_introduction_e_math', 'Introduction', 'o_level_singapore_mathematics', 1, 'Introduction to Elementary Mathematics', 0),
('o_level_singapore_mathematics_numbers_and_operations', 'Numbers and Operations', 'o_level_singapore_mathematics', 1, 'Prime factorization, indices, approximation, and standard form for comprehensive number literacy', 1),
('o_level_singapore_mathematics_ratio_and_proportion', 'Ratio and Proportion', 'o_level_singapore_mathematics', 1, 'Fundamental relationships between quantities and how they change together including direct and inverse proportion', 2),
('o_level_singapore_mathematics_percentage', 'Percentage', 'o_level_singapore_mathematics', 1, 'Comparing quantities, calculating changes, and solving real-world financial and statistical problems', 3),
('o_level_singapore_mathematics_rate_and_speed', 'Rate and Speed', 'o_level_singapore_mathematics', 1, 'Measuring change over time and analyzing motion with speed-time graphs', 4),
('o_level_singapore_mathematics_algebraic_expressions_and_formulae', 'Algebraic Expressions and Formulae', 'o_level_singapore_mathematics', 1, 'Transition from arithmetic to algebra with expression manipulation and formula rearrangement', 5),
('o_level_singapore_mathematics_functions_and_graphs', 'Functions and Graphs', 'o_level_singapore_mathematics', 1, 'Mathematical relationships through coordinate systems covering linear and quadratic functions', 6),
('o_level_singapore_mathematics_equations_and_inequalities', 'Equations and Inequalities', 'o_level_singapore_mathematics', 1, 'Solving for unknown quantities systematically including linear and quadratic equations', 7),
('o_level_singapore_mathematics_set_language_and_notation', 'Set Language and Notation', 'o_level_singapore_mathematics', 1, 'Mathematical language of sets with operations, relationships, and Venn diagrams', 8),
('o_level_singapore_mathematics_matrices', 'Matrices', 'o_level_singapore_mathematics', 1, 'Rectangular arrays of numbers for organizing information and mathematical operations', 9),
('o_level_singapore_mathematics_angles_triangles_and_polygons', 'Angles, Triangles and Polygons', 'o_level_singapore_mathematics', 1, 'Building blocks of shape analysis with angle relationships and polygon properties', 10),
('o_level_singapore_mathematics_congruence_and_similarity', 'Congruence and Similarity', 'o_level_singapore_mathematics', 1, 'Shape relationships including congruence tests and similarity ratios with scale drawings', 11),
('o_level_singapore_mathematics_properties_of_circles', 'Properties of Circles', 'o_level_singapore_mathematics', 1, 'Circle theorems, symmetry properties, and angle relationships in circular geometry', 12),
('o_level_singapore_mathematics_pythagoras_theorem_and_trigonometry', 'Pythagoras Theorem and Trigonometry', 'o_level_singapore_mathematics', 1, 'Calculating unknown lengths and angles in triangles with sine and cosine rules', 13),
('o_level_singapore_mathematics_mensuration', 'Mensuration', 'o_level_singapore_mathematics', 1, 'Measurement and calculation of area, perimeter, volume, and surface area for geometric shapes', 14),
('o_level_singapore_mathematics_coordinate_geometry', 'Coordinate Geometry', 'o_level_singapore_mathematics', 1, 'Algebraic methods for geometric relationships using gradients, distances, and line equations', 15),
('o_level_singapore_mathematics_vectors_in_two_dimensions', 'Vectors in Two Dimensions', 'o_level_singapore_mathematics', 1, 'Vector operations and applications in two-dimensional coordinate systems', 16);

-- O-Level Additional Mathematics Chapters  
INSERT INTO chapters (name, display_name, subject_id, level, description, sort_order) VALUES
('o_level_singapore_add_math_00_introduction_a_math', 'Introduction', 'o_level_singapore_add_math', 1, 'Introduction to Additional Mathematics', 0),
('o_level_singapore_add_math_quadratic_functions', 'Quadratic Functions', 'o_level_singapore_add_math', 1, 'Essential properties and applications of quadratic functions with discriminant theory', 1),
('o_level_singapore_add_math_equations_and_inequalities', 'Equations and Inequalities', 'o_level_singapore_add_math', 1, 'Comprehensive equation solving and inequality analysis using discriminant applications', 2),
('o_level_singapore_add_math_surds', 'Surds', 'o_level_singapore_add_math', 1, 'Fundamental surds manipulation techniques and rationalization methods for algebraic expressions', 3),
('o_level_singapore_add_math_polynomials_and_partial_fractions', 'Polynomials and Partial Fractions', 'o_level_singapore_add_math', 1, 'Advanced polynomial manipulation and partial fraction decomposition for higher mathematics', 4),
('o_level_singapore_add_math_binomial_expansions', 'Binomial Expansions', 'o_level_singapore_add_math', 1, 'Comprehensive binomial theorem applications with factorial notation and expansion techniques', 5),
('o_level_singapore_add_math_exponential_and_logarithmic_functions', 'Exponential and Logarithmic Functions', 'o_level_singapore_add_math', 1, 'Exponential and logarithmic functions as inverse relationships with practical applications', 6),
('o_level_singapore_add_math_trigonometric_functions_identities_equations', 'Trigonometric Functions, Identities and Equations', 'o_level_singapore_add_math', 1, 'Advanced trigonometric concepts including compound angles, R-formulae, and systematic equation solving', 7),
('o_level_singapore_add_math_coordinate_geometry_2d', 'Coordinate Geometry', 'o_level_singapore_add_math', 1, 'Circle equations, point-circle relationships, and analytical geometry techniques', 8),
('o_level_singapore_add_math_proofs_plane_geometry', 'Proofs in Plane Geometry', 'o_level_singapore_add_math', 1, 'Rigorous geometric proof techniques using established theorems and logical reasoning', 9),
('o_level_singapore_add_math_differentiation_and_integration', 'Differentiation and Integration', 'o_level_singapore_add_math', 1, 'Fundamental calculus tools for analyzing change and accumulation with practical applications', 10);

-- O-Level Chemistry Chapters
INSERT INTO chapters (name, display_name, subject_id, level, description, sort_order) VALUES
('o_level_singapore_chemistry_00_introduction_chemistry', 'Introduction', 'o_level_singapore_chemistry', 1, 'Introduction to Chemistry', 0),
('o_level_singapore_chemistry_experimental_chemistry', 'Experimental Chemistry', 'o_level_singapore_chemistry', 1, 'Precision, accuracy, and safety in chemical experimentation with purification techniques', 1),
('o_level_singapore_chemistry_the_particulate_nature_of_matter', 'The Particulate Nature of Matter', 'o_level_singapore_chemistry', 1, 'Kinetic particle theory linking macroscopic properties to microscopic behavior and atomic structure', 2),
('o_level_singapore_chemistry_chemical_bonding_and_structure', 'Chemical Bonding and Structure', 'o_level_singapore_chemistry', 1, 'How atoms combine through ionic, covalent, and metallic bonding to determine material properties', 3),
('o_level_singapore_chemistry_chemical_calculations', 'Chemical Calculations', 'o_level_singapore_chemistry', 1, 'Quantitative chemistry including mole concept, stoichiometry, and concentration calculations', 4),
('o_level_singapore_chemistry_acid_base_chemistry', 'Acid Base Chemistry', 'o_level_singapore_chemistry', 1, 'Nature of acids and bases, their reactions, neutralization, and industrial applications', 5),
('o_level_singapore_chemistry_qualitative_analysis', 'Qualitative Analysis', 'o_level_singapore_chemistry', 1, 'Identifying unknown substances through systematic chemical testing for gases, cations, and anions', 6),
('o_level_singapore_chemistry_redox_chemistry', 'Redox Chemistry', 'o_level_singapore_chemistry', 1, 'Oxidation and reduction reactions, electron transfer, and electrochemical applications', 7),
('o_level_singapore_chemistry_patterns_in_the_periodic_table', 'Patterns in the Periodic Table', 'o_level_singapore_chemistry', 1, 'Periodic trends, group properties, and using element positions to predict characteristics', 8),
('o_level_singapore_chemistry_chemical_energetics', 'Chemical Energetics', 'o_level_singapore_chemistry', 1, 'Energy changes in chemical reactions including exothermic and endothermic processes', 9),
('o_level_singapore_chemistry_rate_of_reactions', 'Rate of Reactions', 'o_level_singapore_chemistry', 1, 'Factors controlling reaction speeds with collision theory and catalyst mechanisms', 10),
('o_level_singapore_chemistry_organic_chemistry', 'Organic Chemistry', 'o_level_singapore_chemistry', 1, 'Carbon-based compounds including hydrocarbons, functional groups, and synthesis pathways', 11),
('o_level_singapore_chemistry_maintaining_air_quality', 'Maintaining Air Quality', 'o_level_singapore_chemistry', 1, 'Atmospheric composition, pollution sources, environmental impacts, and air quality strategies', 12);

-- O-Level Physics Chapters
INSERT INTO chapters (name, display_name, subject_id, level, description, sort_order) VALUES
('o_level_singapore_physics_00_introduction_physics', 'Introduction', 'o_level_singapore_physics', 1, 'Introduction to Physics', 0),
('o_level_singapore_physics_physical_quantities_units_and_measurements', 'Physical Quantities, Units and Measurements', 'o_level_singapore_physics', 1, 'Measurement framework, SI units, vector analysis, and error assessment for physics calculations', 1),
('o_level_singapore_physics_kinematics', 'Kinematics', 'o_level_singapore_physics', 1, 'Motion analysis through mathematical descriptions of position, velocity, and acceleration', 2),
('o_level_singapore_physics_dynamics', 'Dynamics', 'o_level_singapore_physics', 1, 'Relationship between forces and motion establishing Newton''s laws as fundamental principles', 3),
('o_level_singapore_physics_turning_effect_of_forces', 'Turning Effect of Forces', 'o_level_singapore_physics', 1, 'Rotational motion, equilibrium conditions, and stability concepts around pivot points', 4),
('o_level_singapore_physics_pressure', 'Pressure', 'o_level_singapore_physics', 1, 'Pressure as force per unit area with applications in hydraulic systems and fluid statics', 5),
('o_level_singapore_physics_energy', 'Energy', 'o_level_singapore_physics', 1, 'Energy stores, transfer pathways, conservation principles, and renewable energy comparisons', 6),
('o_level_singapore_physics_kinetic_particle_model_of_matter', 'Kinetic Particle Model of Matter', 'o_level_singapore_physics', 1, 'Microscopic view explaining macroscopic properties through particle behavior and motion', 7),
('o_level_singapore_physics_thermal_processes', 'Thermal Processes', 'o_level_singapore_physics', 1, 'Heat transfer mechanisms including conduction, convection, and radiation in various applications', 8),
('o_level_singapore_physics_thermal_properties_of_matter', 'Thermal Properties of Matter', 'o_level_singapore_physics', 1, 'Matter response to thermal energy through temperature variations and phase transitions', 9),
('o_level_singapore_physics_general_wave_properties', 'General Wave Properties', 'o_level_singapore_physics', 1, 'Wave fundamentals, energy transfer, and acoustic phenomena including ultrasound applications', 10),
('o_level_singapore_physics_electromagnetic_spectrum', 'Electromagnetic Spectrum', 'o_level_singapore_physics', 1, 'Electromagnetic waves across frequency ranges with applications and biological safety considerations', 11),
('o_level_singapore_physics_light', 'Light', 'o_level_singapore_physics', 1, 'Light behavior through reflection, refraction, and optical instruments with geometric optics principles', 12),
('o_level_singapore_physics_static_electricity', 'Static Electricity', 'o_level_singapore_physics', 1, 'Electrostatic phenomena, electric fields, charging mechanisms, and practical safety applications', 13),
('o_level_singapore_physics_current_of_electricity', 'Current of Electricity', 'o_level_singapore_physics', 1, 'Electric current fundamentals, circuit analysis, and electrical resistance with temperature effects', 14),
('o_level_singapore_physics_dc_circuits', 'DC Circuits', 'o_level_singapore_physics', 1, 'Direct current circuit analysis with series and parallel combinations', 15);

-- O-Level English Chapters
INSERT INTO chapters (name, display_name, subject_id, level, description, sort_order) VALUES
('o_level_singapore_english_00_introduction_english', 'Introduction', 'o_level_singapore_english', 1, 'Introduction to English', 0),
('o_level_singapore_english_english_vocabulary_bank', 'English Vocabulary Bank', 'o_level_singapore_english', 1, 'Comprehensive vocabulary resource for descriptive language and advanced expressions across all text types', 1),
('o_level_singapore_english_essay_narrative_techniques', 'Essay Narrative Techniques', 'o_level_singapore_english', 1, 'Sophisticated personal recount techniques through engaging narrative elements and character development', 2),
('o_level_singapore_english_essay_argumentative_techniques', 'Essay Argumentative Techniques', 'o_level_singapore_english', 1, 'Advanced persuasive writing techniques with PEEL paragraph structures and thesis development', 3),
('o_level_singapore_english_essay_discursive_techniques', 'Essay Discursive Techniques', 'o_level_singapore_english', 1, 'Multi-perspective analysis techniques for balanced discussion and objective viewpoint exploration', 4),
('o_level_singapore_english_narrative_writing_structure', 'Narrative Writing Structure', 'o_level_singapore_english', 1, 'Comprehensive framework for constructing engaging personal recounts and story essays', 5),
('o_level_singapore_english_argumentative_writing_structure', 'Argumentative Writing Structure', 'o_level_singapore_english', 1, 'Systematic guidance for constructing persuasive academic arguments with logical reasoning', 6),
('o_level_singapore_english_discursive_writing_structure', 'Discursive Writing Structure', 'o_level_singapore_english', 1, 'Framework for balanced essay exploration maintaining objectivity and synthesis thinking', 7),
('o_level_singapore_english_paragraph_structure_techniques', 'Paragraph Structure Techniques', 'o_level_singapore_english', 1, 'Systematic PEEL framework for constructing well-developed analytical paragraphs', 8),
('o_level_singapore_english_formal_letter_writing', 'Formal Letter Writing', 'o_level_singapore_english', 1, 'Professional communication including request letters, complaints, and business correspondence', 9),
('o_level_singapore_english_speech_writing_and_delivery', 'Speech Writing and Delivery', 'o_level_singapore_english', 1, 'Structured guidance for award ceremonies, presentations, and formal speaking occasions', 10);

-- O-Level Geography Chapters
INSERT INTO chapters (name, display_name, subject_id, level, description, sort_order) VALUES
('o_level_singapore_geography_00_introduction_geography', 'Introduction', 'o_level_singapore_geography', 1, 'Introduction to Geography', 0),
('o_level_singapore_geography_thinking_geographically', 'Thinking Geographically', 'o_level_singapore_geography', 1, 'Geographic thinking and spatial relationships including human-environment interactions', 1),
('o_level_singapore_geography_sustainable_development', 'Sustainable Development', 'o_level_singapore_geography', 1, 'Community development while maintaining environmental and social balance for future generations', 2),
('o_level_singapore_geography_geographical_methods', 'Geographical Methods', 'o_level_singapore_geography', 1, 'Systematic geographic inquiry through fieldwork, data collection, and analytical techniques', 3),
('o_level_singapore_geography_tourism_activity', 'Tourism Activity', 'o_level_singapore_geography', 1, 'Tourism system components and factors enabling tourism growth and destination development', 4),
('o_level_singapore_geography_tourism_development', 'Tourism Development', 'o_level_singapore_geography', 1, 'Complex impacts of tourism development on economic, social, and environmental systems', 5),
('o_level_singapore_geography_sustainable_tourism_development', 'Sustainable Tourism Development', 'o_level_singapore_geography', 1, 'Tourism approaches minimizing negative impacts while maximizing stakeholder benefits', 6),
('o_level_singapore_geography_weather_and_climate', 'Weather and Climate', 'o_level_singapore_geography', 1, 'Atmospheric system fundamentals with temperature, precipitation, and wind pattern analysis', 7),
('o_level_singapore_geography_climate_change', 'Climate Change', 'o_level_singapore_geography', 1, 'Global climate change causes, evidence, impacts on natural and human systems', 8),
('o_level_singapore_geography_climate_action', 'Climate Action', 'o_level_singapore_geography', 1, 'Climate action strategies including adaptation, mitigation, and extreme weather responses', 9);

-- O-Level History Chapters
INSERT INTO chapters (name, display_name, subject_id, level, description, sort_order) VALUES
('o_level_singapore_history_00_introduction_history', 'Introduction', 'o_level_singapore_history', 1, 'Introduction to History', 0),
('o_level_singapore_history_extension_of_european_control_british_malaya', 'Extension of European Control: British Malaya', 'o_level_singapore_history', 1, 'British intervention in Malaya during 1870s-1920s and transformation impacts on local societies', 1),
('o_level_singapore_history_extension_of_european_control_dutch_indonesia', 'Extension of European Control: Dutch Indonesia', 'o_level_singapore_history', 1, 'Dutch colonial expansion in Indonesia during 1870s-1920s with focus on administrative policies', 2),
('o_level_singapore_history_extension_of_european_control_french_vietnam', 'Extension of European Control: French Vietnam', 'o_level_singapore_history', 1, 'French colonial expansion in Vietnam from 1840s-1890s including intervention motivations and impacts', 3),
('o_level_singapore_history_after_world_war_i_paris_peace_conference', 'After World War I: Paris Peace Conference', 'o_level_singapore_history', 1, 'Post-WWI peace settlement, League of Nations establishment, and collective security attempts', 4),
('o_level_singapore_history_rise_of_authoritarian_regimes_nazi_germany', 'Rise of Authoritarian Regimes: Nazi Germany', 'o_level_singapore_history', 1, 'Nazi Germany rise during 1920s-1930s through Weimar Republic weaknesses and Hitler''s consolidation', 5),
('o_level_singapore_history_rise_of_authoritarian_regimes_militarist_japan', 'Rise of Authoritarian Regimes: Militarist Japan', 'o_level_singapore_history', 1, 'Japanese militarism rise during 1920s-1930s through democratic weaknesses and ultranationalist appeal', 6),
('o_level_singapore_history_war_in_europe_outbreak_wwii', 'War in Europe: Outbreak of WWII', 'o_level_singapore_history', 1, 'Key developments leading to WWII outbreak in Europe including appeasement failures and Hitler''s strategy', 7),
('o_level_singapore_history_war_in_asia_pacific_outbreak_wwii', 'War in Asia-Pacific: Outbreak of WWII', 'o_level_singapore_history', 1, 'Developments leading to Pacific War including Japanese expansionism and Pearl Harbor attack', 8),
('o_level_singapore_history_end_of_world_war_ii', 'End of World War II', 'o_level_singapore_history', 1, 'Allied victory factors and Axis defeat causes in both European and Asia-Pacific theaters', 9),
('o_level_singapore_history_cold_war_origins_and_development_in_europe', 'Cold War: Origins and Development in Europe', 'o_level_singapore_history', 1, 'Cold War origins 1945-1955 through superpower emergence and European division', 10),
('o_level_singapore_history_cold_war_korean_war', 'Cold War: Korean War', 'o_level_singapore_history', 1, 'Korean War 1950-1953 as Cold War extension with superpower involvement in civil conflict', 11),
('o_level_singapore_history_cold_war_vietnam_war', 'Cold War: Vietnam War', 'o_level_singapore_history', 1, 'Vietnam War 1954-1975 as Cold War case study with lasting impacts on international relations', 12),
('o_level_singapore_history_decolonisation_british_malaya', 'Decolonisation: British Malaya', 'o_level_singapore_history', 1, 'British Malaya decolonization 1945-1957 through constitutional development and political cooperation', 13),
('o_level_singapore_history_decolonisation_dutch_indonesia', 'Decolonisation: Dutch Indonesia', 'o_level_singapore_history', 1, 'Dutch Indonesia decolonization 1945-1949 through independence struggle and colonial responses', 14),
('o_level_singapore_history_decolonisation_french_vietnam', 'Decolonisation: French Vietnam', 'o_level_singapore_history', 1, 'French Vietnam decolonization 1945-1954 through armed resistance and international involvement', 15),
('o_level_singapore_history_end_of_cold_war', 'End of Cold War', 'o_level_singapore_history', 1, 'Cold War conclusion 1980s-1991 through USSR decline and peaceful transition to post-Cold War order', 16);

-- O-Level Social Studies Chapters
INSERT INTO chapters (name, display_name, subject_id, level, description, sort_order) VALUES
('o_level_singapore_social_studies_00_introduction_social_studies', 'Introduction', 'o_level_singapore_social_studies', 1, 'Introduction to Social Studies', 0),
('o_level_singapore_social_studies_challenges_in_deciding_what_is_good_for_society', 'Challenges in Deciding What is Good for Society', 'o_level_singapore_social_studies', 1, 'Fundamental challenges governments face when making decisions for collective societal good', 1),
('o_level_singapore_social_studies_ideas_shaping_good_governance', 'Ideas Shaping Good Governance', 'o_level_singapore_social_studies', 1, 'Fundamental principles that shape effective governance including leadership, anticipating change, and meritocracy', 2),
('o_level_singapore_social_studies_role_of_government_in_working_for_societys_good', 'Role of Government in Working for Society''s Good', 'o_level_singapore_social_studies', 1, 'Critical government responsibilities including maintaining order, ensuring justice, and providing services', 3),
('o_level_singapore_social_studies_role_of_citizens_in_working_for_societys_good', 'Role of Citizens in Working for Society''s Good', 'o_level_singapore_social_studies', 1, 'How citizens actively contribute to societal well-being through participation and responsibility', 4),
('o_level_singapore_social_studies_factors_shaping_identity_and_contributing_to_diversity', 'Factors Shaping Identity and Contributing to Diversity', 'o_level_singapore_social_studies', 1, 'Multiple factors that shape individual and collective identities in Singapore''s diverse society', 5),
('o_level_singapore_social_studies_reasons_for_greater_diversity_in_singapore', 'Reasons for Greater Diversity in Singapore', 'o_level_singapore_social_studies', 1, 'Historical, economic, and policy factors that created and sustained Singapore''s multicultural society', 6),
('o_level_singapore_social_studies_experiences_and_effects_of_living_in_a_diverse_society', 'Experiences and Effects of Living in a Diverse Society', 'o_level_singapore_social_studies', 1, 'Daily lived experiences and societal impacts of diversity including benefits and challenges', 7),
('o_level_singapore_social_studies_challenges_in_a_diverse_society', 'Challenges in a Diverse Society', 'o_level_singapore_social_studies', 1, 'Difficulties and tensions that arise in diverse societies including prejudice and resource competition', 8),
('o_level_singapore_social_studies_management_of_sociocultural_diversity', 'Management of Sociocultural Diversity', 'o_level_singapore_social_studies', 1, 'Strategies and policies for managing cultural and social differences through integration approaches', 9),
('o_level_singapore_social_studies_management_of_socioeconomic_diversity', 'Management of Socioeconomic Diversity', 'o_level_singapore_social_studies', 1, 'Addressing income inequality and socioeconomic disparities through policy interventions and social support', 10),
('o_level_singapore_social_studies_globalization', 'Globalization', 'o_level_singapore_social_studies', 1, 'Increasing interconnectedness of countries through economic, technological, political, and cultural exchanges', 11),
('o_level_singapore_social_studies_economic_impacts_of_globalization', 'Economic Impacts of Globalization', 'o_level_singapore_social_studies', 1, 'How globalization transforms economies at national, corporate, and individual levels', 12),
('o_level_singapore_social_studies_cultural_impacts_of_globalization', 'Cultural Impacts of Globalization', 'o_level_singapore_social_studies', 1, 'How global interconnectedness transforms cultural practices, values, and identities worldwide', 13),
('o_level_singapore_social_studies_managing_security_challenges_in_a_globalized_world', 'Managing Security Challenges in a Globalized World', 'o_level_singapore_social_studies', 1, 'Security threats from global interconnectedness and strategies for addressing them effectively', 14);

-- N-Level Biology Chapters (based on 7 key themes)
-- example for different chapters for n_level_singapore_biology and o_level_singapore_biology
INSERT INTO chapters (name, display_name, subject_id, level, description, sort_order) VALUES
('n_level_singapore_biology_01_the_cell', 'The Cell', 'n_level_singapore_biology', 1, 'Diverse life forms are similar in that their basic unit are cells', 1),
('n_level_singapore_biology_02_structure_and_function', 'Structure and Function', 'n_level_singapore_biology', 1, 'Structure and function of organisms from the molecular to the organ system levels are related to each other', 2),
('n_level_singapore_biology_03_systems', 'Systems', 'n_level_singapore_biology', 1, 'Biological systems interact among themselves and with the environment resulting in the flow of energy and nutrients', 3),
('n_level_singapore_biology_04_energy', 'Energy', 'n_level_singapore_biology', 1, 'To ensure survival, living organisms obtain, transform and utilise energy from the external world', 4),
('n_level_singapore_biology_05_homeostasis', 'Homeostasis, Co-ordination and Response', 'n_level_singapore_biology', 1, 'Living organisms detect changes both from the surrounding environment and within themselves so that they are able to respond to these changes to maintain a constant internal environment needed for sustaining life', 5),
('n_level_singapore_biology_06_heredity', 'Heredity', 'n_level_singapore_biology', 1, 'Genetic information is passed down from parents to offspring during reproduction to ensure the continuity of life', 6),
('n_level_singapore_biology_07_evolution', 'Evolution', 'n_level_singapore_biology', 1, 'The diversity of living organisms is achieved through a process of evolution, driven by mechanisms such as natural selection', 7);


-- Seed data from: characters.sql
-- Characters Seed Data
-- This seeds the characters table with the current character data

INSERT INTO characters (
  id,
  name,
  slug,
  subject,
  description,
  image_url,
  personality_prompt,
  is_active,
  display_order,
  created_at,
  updated_at
) VALUES 
(
  1,
  'Eddy',
  'eddy',
  'GENERAL',
  'A friendly lion character who loves to teach and learn with students',
  'eddy.png',
  'Eddy is a lion character that talks and is highly intelligent, he educates with passion. He is friendly, encouraging, and always ready to help students learn.',
  true,
  1,
  NOW(),
  NOW()
),
(
  2,
  'Pooh',
  'pooh',
  'BIOLOGY',
  'A cuddly bear who makes biology fun and accessible for everyone',
  'pooh.png',
  'Pooh is a warm, friendly bear who loves exploring nature and biology. He makes complex biological concepts easy to understand through simple analogies and his gentle, nurturing approach.',
  true,
  2,
  NOW(),
  NOW()
),
(
  3,
  'Snorlax',
  'snorlax',
  'CHEMISTRY',
  'A tech-savvy character passionate about chemistry and future technologies',
  'snorlax.png',
  'Snorlax is an innovative character who loves chemistry and technology. He brings excitement to learning about chemical reactions and helps students understand complex scientific concepts through modern approaches.',
  true,
  3,
  NOW(),
  NOW()
),
(
  4,
  'Maya',
  'maya',
  'HISTORY',
  'A wise storyteller who brings history to life through engaging narratives',
  'maya.png',
  'Maya is a wise and experienced historian who brings the past to life through captivating stories. She helps students understand historical events and their significance through engaging narratives and critical thinking.',
  true,
  4,
  NOW(),
  NOW()
),
(
  5,
  'Sherlock',
  'sherlock',
  'SOCIAL_STUDIES',
  'A detective character who investigates social phenomena and human behavior',
  'sherlock.png',
  'Sherlock is an analytical thinker who loves investigating social phenomena and human behavior. He helps students understand society, culture, and social structures through investigative methods and logical reasoning.',
  true,
  5,
  NOW(),
  NOW()
),
(
  6,
  'Mickey',
  'mickey',
  'GENERAL',
  'A cheerful character ready to help with any subject',
  'mickey.png',
  'Mickey is a cheerful and enthusiastic character who loves learning and teaching. He brings positive energy to any subject and helps keep students motivated and engaged.',
  true,
  6,
  NOW(),
  NOW()
),
(
  7,
  'Einstein',
  'einstein',
  'PHYSICS',
  'A brilliant scientist who makes physics concepts accessible and exciting',
  'einstein.png',
  'Einstein is a brilliant and curious physicist who loves exploring the fundamental laws of the universe. He makes complex physics concepts understandable through thought experiments and real-world examples, inspiring students to see the beauty in scientific discovery.',
  true,
  7,
  NOW(),
  NOW()
),
(
  8,
  'Atlas',
  'atlas',
  'GEOGRAPHY',
  'An adventurous explorer passionate about world geography and cultures',
  'atlas.png',
  'Atlas is an adventurous explorer who has traveled the world and loves sharing knowledge about different places, cultures, and geographical features. He brings geography to life through exciting stories and helps students understand our interconnected world.',
  true,
  8,
  NOW(),
  NOW()
),
(
  9,
  'Pythagoras',
  'pythagoras',
  'MATHEMATICS',
  'A mathematical genius who finds beauty in numbers and patterns',
  'pythagoras.png',
  'Pythagoras is a passionate mathematician who sees beauty in numbers, patterns, and geometric relationships. He helps students discover the logic and elegance of mathematics through clear explanations and practical applications.',
  true,
  9,
  NOW(),
  NOW()
),
(
  10,
  'Euler',
  'euler',
  'ADDITIONAL_MATHEMATICS',
  'A mathematical mastermind specializing in advanced concepts and calculus',
  'euler.png',
  'Euler is a mathematical mastermind who excels at advanced mathematics and calculus. He breaks down complex mathematical concepts into manageable steps and helps students build confidence in tackling challenging problems.',
  true,
  10,
  NOW(),
  NOW()
),
(
  11,
  'Shakespeare',
  'shakespeare',
  'LITERATURE',
  'A master storyteller who brings literary works to life with passion',
  'shakespeare.png',
  'Shakespeare is a passionate storyteller and literary expert who brings classic and modern literature to life. He helps students understand themes, characters, and writing techniques while fostering a love for reading and creative expression.',
  true,
  11,
  NOW(),
  NOW()
),
(
  12,
  'Oxford',
  'oxford',
  'ENGLISH',
  'An eloquent language expert who masters grammar, writing, and communication',
  'oxford.png',
  'Oxford is an eloquent and knowledgeable English language expert who helps students master grammar, writing, and effective communication. He makes language learning engaging through practical exercises and clear explanations.',
  true,
  12,
  NOW(),
  NOW()
);

-- Commit transaction
COMMIT;

-- ==========================================
-- RESET COMPLETE
-- Triggers dropped: 3
-- Functions dropped: 4
-- Tables dropped: 33
-- Tables created: 34
-- Seed files applied: 3
-- Generated: 2025-09-16T10:45:44.443Z
-- ==========================================
