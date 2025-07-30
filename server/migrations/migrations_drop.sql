
 -- Drop trigger (if exists)
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

  -- Drop function (if exists) 
  DROP FUNCTION IF EXISTS public.handle_new_user();