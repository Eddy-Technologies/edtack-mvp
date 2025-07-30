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

-- Function to handle new user_info creation
CREATE OR REPLACE FUNCTION public.handle_new_user_info()
RETURNS TRIGGER AS $$
DECLARE
  v_role_id INT;
  v_user_email text;
  v_user_role text;
BEGIN
  RAISE LOG 'Trigger started for user_info_id: %', NEW.id;
  RAISE LOG 'Storing raw_user_meta_data: %', NEW.raw_user_meta_data;  -- Print start
  
  SELECT id INTO v_role_id FROM public.roles WHERE role_name = NEW.raw_user_meta_data ->> 'user_role';
  RAISE LOG '[handle_new_user] Selected role_id: % for role: %', v_role_id, NEW.raw_user_meta_data ->> 'user_role';  -- Print variable
  
  -- Get user email from auth.users if user_id exists
  SELECT email
  INTO v_user_email
  FROM auth.users 
  WHERE id = NEW.user_id;

  RAISE LOG '[handle_new_user_info] Found email: % for user_id: %', v_user_email, NEW.user_id;

  -- Create user_emails record if email exists
  INSERT INTO public.user_emails (user_info_id, email, is_primary) 
  VALUES (NEW.id, v_user_email, true);
  RAISE LOG '[handle_new_user_info] Inserted user_emails with email: %', v_user_email;

  SELECT id INTO v_role_id FROM public.roles WHERE role_name = v_user_role;
  RAISE LOG '[handle_new_user_info] Selected role_id: % for role: %', v_role_id, v_user_role;
    
  INSERT INTO public.user_roles (user_info_id, role_id)
  VALUES (NEW.id, v_role_id);
  RAISE LOG '[handle_new_user_info] Inserted user_roles with role_id: %', v_role_id;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION '[handle_new_user_info] Failed to process user_info: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_user_info_created
AFTER INSERT ON public.user_infos
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_info();