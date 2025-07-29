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