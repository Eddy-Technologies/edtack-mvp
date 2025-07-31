DROP VIEW IF EXISTS all_users;

CREATE OR REPLACE VIEW all_users AS
SELECT
  ui.id AS user_info_id,
  ui.first_name,
  ui.last_name,
  ui.gender,
  ui.level_type,
  ui.payment_customer_id,
  CASE
    WHEN ui.user_id IS NOT NULL THEN 'auth_' || ui.user_id::text
    WHEN ui.app_user_id IS NOT NULL THEN 'app_' || ui.app_user_id::text
    ELSE NULL
  END AS prefixed_auth_id,
  CASE
    WHEN ui.user_id IS NOT NULL THEN au.email
    ELSE NULL
  END AS email,
  CASE
    WHEN ui.app_user_id IS NOT NULL THEN appu.username
    ELSE NULL
  END AS username,
  CASE
    WHEN ui.user_id IS NOT NULL THEN 'auth'
    WHEN ui.app_user_id IS NOT NULL THEN 'app'
    ELSE NULL
  END AS auth_source,
  ui.created_at,
  ui.updated_at
FROM user_infos ui
LEFT JOIN auth.users au ON ui.user_id = au.id
LEFT JOIN app_users appu ON ui.app_user_id = appu.id;


 -- Drop trigger (if exists)
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

  -- Drop function (if exists) 
  DROP FUNCTION IF EXISTS public.handle_new_user();
  DROP FUNCTION IF EXISTS public.handle_new_user_info() CASCADE;
    DROP FUNCTION IF EXISTS public.update_user_info_with_relations() CASCADE;

-- RPC function to atomically update user_infos with related tables
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
    id, user_id, first_name, last_name, level_type, 
    payment_customer_id, is_active, onboarding_completed, created_at, updated_at
  ) VALUES (
    p_user_info_id,
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

  -- Handle email if provided
  IF p_email IS NOT NULL THEN
    -- Delete existing emails
    DELETE FROM public.user_emails WHERE user_info_id = p_user_info_id;
    RAISE LOG '[update_user_info_with_relations] Deleted existing emails for: %', p_user_info_id;

    -- Insert new email as primary
    INSERT INTO public.user_emails (user_info_id, email, is_primary)
    VALUES (p_user_info_id, p_email, true);
    
    RAISE LOG '[update_user_info_with_relations] Inserted email: %', p_email;
  END IF;

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
