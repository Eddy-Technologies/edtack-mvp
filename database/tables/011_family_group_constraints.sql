-- Family Group Constraints (parent_user_info_id now references user_infos)
CREATE TABLE family_group_constraints (
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  parent_user_info_id uuid NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE, -- Parent is a user_infos user
  PRIMARY KEY (group_id, parent_user_info_id),
  UNIQUE (parent_user_info_id, group_id)
);

-- Trigger function to enforce family group type and parent role
CREATE OR REPLACE FUNCTION check_family_group_type()
RETURNS TRIGGER AS $$
DECLARE
  linked_user_id UUID;
  linked_app_user_id UUID;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM groups WHERE id = NEW.group_id AND group_type = 'family'
  ) THEN
    RAISE EXCEPTION 'group_id % is not a family group', NEW.group_id;
  END IF;

  -- Ensure the parent_user_info_id corresponds to an auth.users user (parent role constraint)
  SELECT user_id, app_user_id INTO linked_user_id, linked_app_user_id
  FROM user_infos WHERE id = NEW.parent_user_info_id;

  IF linked_user_id IS NULL OR linked_app_user_id IS NOT NULL THEN
    RAISE EXCEPTION 'Parent in family group must be an email/phone-based user (linked to auth.users).';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_family_group_type
BEFORE INSERT OR UPDATE ON family_group_constraints
FOR EACH ROW EXECUTE FUNCTION check_family_group_type();