-- Class Group Constraints Table (teacher_user_info_id now references user_infos)
CREATE TABLE class_group_constraints (
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  teacher_user_info_id uuid NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE, -- Teacher is a user_infos user
  PRIMARY KEY (group_id, teacher_user_info_id)
);

-- Trigger function to enforce class group type and teacher role
CREATE OR REPLACE FUNCTION check_class_group_type()
RETURNS TRIGGER AS $$
DECLARE
  linked_user_id UUID;
  linked_app_user_id UUID;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM groups WHERE id = NEW.group_id AND group_type = 'class'
  ) THEN
    RAISE EXCEPTION 'group_id % is not a class group', NEW.group_id;
  END IF;

  -- Ensure the teacher_user_info_id corresponds to an auth.users user (teacher role constraint)
  SELECT user_id, app_user_id INTO linked_user_id, linked_app_user_id
  FROM user_infos WHERE id = NEW.teacher_user_info_id;

  IF linked_user_id IS NULL OR linked_app_user_id IS NOT NULL THEN
    RAISE EXCEPTION 'Teacher in class group must be an email/phone-based user (linked to auth.users).';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_class_group_type
BEFORE INSERT OR UPDATE ON class_group_constraints
FOR EACH ROW EXECUTE FUNCTION check_class_group_type();