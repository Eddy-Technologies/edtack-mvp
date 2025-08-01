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
  p_level_type TEXT DEFAULT NULL
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
    id, email, user_id, first_name, last_name, level_type, 
    payment_customer_id, is_active, onboarding_completed, created_at, updated_at
  ) VALUES (
    p_user_info_id,
    p_email,
    p_user_id,
    p_first_name,
    p_last_name,
    p_level_type,
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
    SELECT id INTO v_role_id FROM public.roles WHERE role_name = p_role_name;
    
    IF v_role_id IS NULL THEN
      RAISE EXCEPTION '[update_user_info_with_relations] Invalid role name: %', p_role_name;
    END IF;

    INSERT INTO public.user_roles (user_info_id, role_id)
    VALUES (p_user_info_id, v_role_id);
    
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
