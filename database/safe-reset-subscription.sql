-- ======================================
-- SAFE SUBSCRIPTION SCHEMA RESET
-- ======================================
-- This script safely handles cases where tables may not exist
-- Run this in your Supabase SQL editor

DO $$ 
BEGIN
    RAISE NOTICE 'Starting subscription schema reset...';
END $$;

-- ======================================
-- 1. SAFE DROP POLICIES
-- ======================================

DO $$ 
BEGIN
    -- Drop policies if they exist
    IF EXISTS (SELECT 1 FROM pg_policy WHERE policyname = 'subscription_plans_select_policy') THEN
        DROP POLICY subscription_plans_select_policy ON subscription_plans;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policy WHERE policyname = 'user_subscriptions_select_policy') THEN
        DROP POLICY user_subscriptions_select_policy ON user_subscriptions;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policy WHERE policyname = 'user_subscriptions_insert_policy') THEN
        DROP POLICY user_subscriptions_insert_policy ON user_subscriptions;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policy WHERE policyname = 'user_subscriptions_update_policy') THEN
        DROP POLICY user_subscriptions_update_policy ON user_subscriptions;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policy WHERE policyname = 'payment_transactions_select_policy') THEN
        DROP POLICY payment_transactions_select_policy ON payment_transactions;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policy WHERE policyname = 'stripe_webhook_events_service_policy') THEN
        DROP POLICY stripe_webhook_events_service_policy ON stripe_webhook_events;
    END IF;
    
    RAISE NOTICE '✓ Policies dropped safely';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Note: Some policies may not have existed - %', SQLERRM;
END $$;

-- ======================================
-- 2. SAFE DROP TRIGGERS
-- ======================================

DO $$ 
BEGIN
    -- Drop triggers if they exist
    DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON subscription_plans;
    DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
    DROP TRIGGER IF EXISTS update_payment_transactions_updated_at ON payment_transactions;
    
    RAISE NOTICE '✓ Triggers dropped safely';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Note: Some triggers may not have existed - %', SQLERRM;
END $$;

-- ======================================
-- 3. SAFE DROP TABLES
-- ======================================

DO $$ 
BEGIN
    -- Drop tables in correct order (dependent tables first)
    DROP TABLE IF EXISTS payment_transactions CASCADE;
    DROP TABLE IF EXISTS user_subscriptions CASCADE;
    DROP TABLE IF EXISTS stripe_webhook_events CASCADE;
    DROP TABLE IF EXISTS subscription_plans CASCADE;
    
    RAISE NOTICE '✓ Tables dropped safely';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Note: Some tables may not have existed - %', SQLERRM;
END $$;

-- ======================================
-- 4. SAFE DROP FUNCTIONS AND TYPES
-- ======================================

DO $$ 
BEGIN
    -- Drop function
    DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
    
    -- Drop custom types
    DROP TYPE IF EXISTS subscription_status CASCADE;
    DROP TYPE IF EXISTS plan_type CASCADE;
    
    RAISE NOTICE '✓ Functions and types dropped safely';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Note: Some functions/types may not have existed - %', SQLERRM;
END $$;

-- ======================================
-- 5. CREATE CUSTOM TYPES
-- ======================================

CREATE TYPE subscription_status AS ENUM (
  'incomplete',
  'incomplete_expired',
  'trialing',
  'active',
  'past_due',
  'canceled',
  'unpaid'
);

CREATE TYPE plan_type AS ENUM (
  'free',
  'premium_monthly',
  'premium_yearly'
);

DO $$ 
BEGIN
    RAISE NOTICE '✓ Custom types created';
END $$;

-- ======================================
-- 6. CREATE TABLES
-- ======================================

-- 6.1 Subscription Plans Table
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  price_sgd DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (price_sgd >= 0),
  interval_type TEXT NOT NULL CHECK (interval_type IN ('month', 'year')),
  interval_count INTEGER NOT NULL DEFAULT 1 CHECK (interval_count > 0),
  stripe_product_id TEXT UNIQUE,
  stripe_price_id TEXT UNIQUE,
  plan_type plan_type NOT NULL UNIQUE,
  features JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6.2 User Subscriptions Table
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_info_id UUID NOT NULL,
  plan_id UUID NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  status subscription_status NOT NULL DEFAULT 'incomplete',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Foreign key constraints (will be added after we verify user_infos exists)
  CONSTRAINT fk_user_subscriptions_plan 
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE RESTRICT
);

-- 6.3 Payment Transactions Table
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_info_id UUID NOT NULL,
  subscription_id UUID,
  stripe_invoice_id TEXT,
  stripe_payment_intent_id TEXT,
  amount_sgd DECIMAL(10,2) NOT NULL CHECK (amount_sgd >= 0),
  currency TEXT NOT NULL DEFAULT 'SGD',
  status TEXT NOT NULL,
  description TEXT,
  receipt_url TEXT,
  invoice_pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Foreign key constraints
  CONSTRAINT fk_payment_transactions_subscription 
    FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id) ON DELETE SET NULL
);

-- 6.4 Stripe Webhook Events Table
CREATE TABLE stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0 CHECK (retry_count >= 0),
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

DO $$ 
BEGIN
    RAISE NOTICE '✓ Tables created successfully';
END $$;

-- ======================================
-- 7. ADD FOREIGN KEY CONSTRAINTS TO USER_INFOS
-- ======================================

DO $$ 
BEGIN
    -- Check if user_infos table exists and add foreign key constraints
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_infos') THEN
        ALTER TABLE user_subscriptions 
        ADD CONSTRAINT fk_user_subscriptions_user_info 
        FOREIGN KEY (user_info_id) REFERENCES user_infos(id) ON DELETE CASCADE;
        
        ALTER TABLE payment_transactions 
        ADD CONSTRAINT fk_payment_transactions_user_info 
        FOREIGN KEY (user_info_id) REFERENCES user_infos(id) ON DELETE CASCADE;
        
        RAISE NOTICE '✓ Foreign key constraints to user_infos added';
    ELSE
        RAISE NOTICE '⚠ Warning: user_infos table not found. Foreign key constraints skipped.';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠ Warning: Could not add user_infos foreign keys - %', SQLERRM;
END $$;

-- ======================================
-- 8. CREATE INDEXES
-- ======================================

-- Essential indexes for performance
CREATE INDEX idx_subscription_plans_plan_type ON subscription_plans(plan_type);
CREATE INDEX idx_subscription_plans_active ON subscription_plans(is_active) WHERE is_active = true;

CREATE INDEX idx_user_subscriptions_user_info_id ON user_subscriptions(user_info_id);
CREATE INDEX idx_user_subscriptions_stripe_subscription_id ON user_subscriptions(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_active_user ON user_subscriptions(user_info_id, status) WHERE status IN ('active', 'trialing');

CREATE INDEX idx_payment_transactions_user_info_id ON payment_transactions(user_info_id);
CREATE INDEX idx_payment_transactions_subscription_id ON payment_transactions(subscription_id) WHERE subscription_id IS NOT NULL;

CREATE INDEX idx_stripe_webhook_events_stripe_event_id ON stripe_webhook_events(stripe_event_id);
CREATE INDEX idx_stripe_webhook_events_processed ON stripe_webhook_events(processed, created_at) WHERE processed = false;

DO $$ 
BEGIN
    RAISE NOTICE '✓ Indexes created successfully';
END $$;

-- ======================================
-- 9. CREATE FUNCTIONS AND TRIGGERS
-- ======================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscription_plans_updated_at 
  BEFORE UPDATE ON subscription_plans 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at 
  BEFORE UPDATE ON user_subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at 
  BEFORE UPDATE ON payment_transactions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DO $$ 
BEGIN
    RAISE NOTICE '✓ Functions and triggers created successfully';
END $$;

-- ======================================
-- 10. ENABLE RLS AND CREATE POLICIES
-- ======================================

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ 
BEGIN
    -- Subscription plans: Public read access
    CREATE POLICY "subscription_plans_select_policy" 
      ON subscription_plans FOR SELECT 
      USING (true);

    -- Check if we can create user-based policies (depends on auth schema existing)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_infos') THEN
        
        -- User subscriptions: Own data only
        CREATE POLICY "user_subscriptions_select_policy" 
          ON user_subscriptions FOR SELECT 
          USING (user_info_id IN (SELECT id FROM user_infos WHERE user_id = auth.uid()));

        CREATE POLICY "user_subscriptions_insert_policy" 
          ON user_subscriptions FOR INSERT 
          WITH CHECK (user_info_id IN (SELECT id FROM user_infos WHERE user_id = auth.uid()));

        CREATE POLICY "user_subscriptions_update_policy" 
          ON user_subscriptions FOR UPDATE 
          USING (user_info_id IN (SELECT id FROM user_infos WHERE user_id = auth.uid()));

        -- Payment transactions: Own data only
        CREATE POLICY "payment_transactions_select_policy" 
          ON payment_transactions FOR SELECT 
          USING (user_info_id IN (SELECT id FROM user_infos WHERE user_id = auth.uid()));

        RAISE NOTICE '✓ User-based RLS policies created';
    ELSE
        RAISE NOTICE '⚠ Warning: Auth schema or user_infos not found. User policies skipped.';
    END IF;

    -- Webhook events: Service role only
    CREATE POLICY "stripe_webhook_events_service_policy" 
      ON stripe_webhook_events FOR ALL 
      USING (auth.role() = 'service_role');

    RAISE NOTICE '✓ RLS policies created successfully';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠ Warning: Some RLS policies could not be created - %', SQLERRM;
END $$;

-- ======================================
-- 11. INSERT DEFAULT SUBSCRIPTION PLANS
-- ======================================

INSERT INTO subscription_plans (
  name, display_name, description, price_sgd, interval_type, plan_type, features
) VALUES
  (
    'free', 
    'Free Plan', 
    'Basic features to get started', 
    0.00, 
    'month', 
    'free',
    '["Limited AI queries per month", "Basic study tools", "Limited practice questions", "Community support"]'
  ),
  (
    'premium_monthly', 
    'Premium Plan', 
    'Everything you need for comprehensive learning', 
    29.00, 
    'month', 
    'premium_monthly',
    '["Unlimited AI queries", "Advanced study tools", "Unlimited practice questions", "Priority support", "Detailed progress tracking", "Offline access"]'
  ),
  (
    'premium_yearly', 
    'Premium Plan - Yearly', 
    'Annual subscription with savings', 
    290.00, 
    'year', 
    'premium_yearly',
    '["Unlimited AI queries", "Advanced study tools", "Unlimited practice questions", "Priority support", "Detailed progress tracking", "Offline access", "Annual savings"]'
  )
ON CONFLICT (plan_type) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  price_sgd = EXCLUDED.price_sgd,
  features = EXCLUDED.features,
  updated_at = now();

DO $$ 
BEGIN
    RAISE NOTICE '✓ Default subscription plans inserted';
END $$;

-- ======================================
-- 12. FINAL VERIFICATION
-- ======================================

DO $$ 
DECLARE
    table_count INTEGER;
    plan_count INTEGER;
BEGIN
    -- Count tables
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_name IN ('subscription_plans', 'user_subscriptions', 'payment_transactions', 'stripe_webhook_events');
    
    -- Count plans
    SELECT COUNT(*) INTO plan_count FROM subscription_plans;
    
    RAISE NOTICE '';
    RAISE NOTICE '================================================';
    RAISE NOTICE '✅ SUBSCRIPTION SCHEMA RESET COMPLETE!';
    RAISE NOTICE '================================================';
    RAISE NOTICE '📊 Tables created: %', table_count;
    RAISE NOTICE '📋 Default plans: %', plan_count;
    RAISE NOTICE '🔒 RLS enabled on all tables';
    RAISE NOTICE '⚡ Indexes and triggers created';
    RAISE NOTICE '================================================';
    RAISE NOTICE '';
    
    -- Show the plans
    RAISE NOTICE '📋 Available subscription plans:';
END $$;

-- Display the created plans
SELECT 
  plan_type,
  display_name,
  CONCAT('SGD ', price_sgd, '/', interval_type) as pricing,
  is_active
FROM subscription_plans 
ORDER BY price_sgd;

-- Show table structure verification
SELECT 
  'Tables created:' as info,
  string_agg(tablename, ', ') as tables
FROM pg_tables 
WHERE tablename IN ('subscription_plans', 'user_subscriptions', 'payment_transactions', 'stripe_webhook_events');