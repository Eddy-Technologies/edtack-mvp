-- Parent-Child Relationship Table (both parent and child link to user_infos)
CREATE TABLE parent_child (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_info_id uuid NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE, -- Parent is a user_infos user
  child_user_info_id uuid NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE, -- Child is a user_infos user
  UNIQUE (parent_user_info_id, child_user_info_id) -- A parent-child pair is unique
);

-- Trigger function to prevent cyclic parenting and ensure parent is auth.users
CREATE OR REPLACE FUNCTION prevent_cyclic_parenting()
RETURNS TRIGGER AS $$
DECLARE
  parent_auth_id UUID;
  child_auth_id UUID;
  child_app_auth_id UUID;
BEGIN
  -- Fetch auth.users.id for the parent (enforce parent is auth.users)
  SELECT user_id INTO parent_auth_id
  FROM user_infos WHERE id = NEW.parent_user_info_id;

  IF parent_auth_id IS NULL THEN
    RAISE EXCEPTION 'Parent must be an email/phone-based user (linked to auth.users).';
  END IF;

  -- Fetch auth.users.id and app_users.id for the child
  SELECT user_id, app_user_id INTO child_auth_id, child_app_auth_id
  FROM user_infos WHERE id = NEW.child_user_info_id;

  -- A user cannot be their own parent (direct link check)
  IF NEW.parent_user_info_id = NEW.child_user_info_id THEN
    RAISE EXCEPTION 'A user cannot be their own parent.';
  END IF;

  -- Simplified cyclic parenting check:
  -- This check is complex with mixed auth types. A full, robust cycle check
  -- would require more advanced graph traversal logic considering both user_id and app_user_id paths.
  -- For this schema, we'll check if the child's user_info_id is an ancestor of the parent's user_info_id.
  IF EXISTS (
    WITH RECURSIVE ancestry AS (
      SELECT pc.parent_user_info_id AS ancestor_info_id, pc.child_user_info_id AS current_child_info_id
      FROM parent_child pc
      WHERE pc.parent_user_info_id = NEW.child_user_info_id -- Start from potential child's parents

      UNION ALL

      SELECT pc_rec.parent_user_info_id, pc_rec.child_user_info_id
      FROM parent_child pc_rec
      JOIN ancestry a ON pc_rec.child_user_info_id = a.ancestor_info_id -- Recursively find ancestors
    )
    SELECT 1 FROM ancestry WHERE ancestor_info_id = NEW.parent_user_info_id
  ) THEN
    RAISE EXCEPTION 'Cyclic parenting detected.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_cyclic_parenting
BEFORE INSERT OR UPDATE ON parent_child
FOR EACH ROW EXECUTE FUNCTION prevent_cyclic_parenting();