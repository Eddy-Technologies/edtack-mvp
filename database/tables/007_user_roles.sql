-- User Roles Table (Many-to-Many, now links to user_infos)
CREATE TABLE user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_info_id uuid NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE,
  role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  UNIQUE (user_info_id, role_id) -- A user_info can only have one of each role
);

-- Trigger function to enforce user role rules based on user_infos links
-- Ensures 'parent'/'teacher' roles are only assigned to profiles linked to auth.users
CREATE OR REPLACE FUNCTION enforce_user_role_user_type()
RETURNS TRIGGER AS $$
DECLARE
  role_name_val TEXT;
  linked_user_id UUID;
  linked_app_user_id UUID;
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

  -- Fetch the linked auth.users.id and app_users.id from user_infos
  SELECT user_id, app_user_id INTO linked_user_id, linked_app_user_id
  FROM public.user_infos WHERE id = NEW.user_info_id;

  RAISE LOG 'Getting user_id: %, app_user_id: %', linked_user_id, linked_app_user_id;

  IF role_name_val IN ('PARENT', 'TEACHER') THEN
    -- Parents and Teachers must be linked to auth.users (email/phone)
    IF linked_user_id IS NULL OR linked_app_user_id IS NOT NULL THEN
      RAISE EXCEPTION '[enforce_user_role_user_type] Roles "parent" and "teacher" must be assigned to profiles linked to auth.users (user_id only)';
    END IF;
  ELSIF role_name_val = 'STUDENT' THEN
    -- Students can be linked to either auth.users or app_users.
    NULL; -- No additional check needed here for student
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION '[enforce_user_role_user_type] Failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enforce_user_role_user_type
BEFORE INSERT OR UPDATE ON user_roles
FOR EACH ROW EXECUTE FUNCTION enforce_user_role_user_type();