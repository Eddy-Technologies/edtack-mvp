CREATE TABLE group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_info_id uuid REFERENCES user_infos(id) ON DELETE CASCADE,
  invited_email VARCHAR(255),
  status text NOT NULL,
  invited_by uuid REFERENCES user_infos(id) ON DELETE SET NULL,
  joined_at timestamp with time zone DEFAULT now(),
  invited_at timestamp with time zone DEFAULT now(),
  is_creator boolean DEFAULT false,
  CONSTRAINT chk_user_or_email CHECK (user_info_id IS NOT NULL OR invited_email IS NOT NULL),
  UNIQUE (group_id, user_info_id)
);

CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_invited_email ON group_members(invited_email) WHERE invited_email IS NOT NULL;