-- Group Memberships Table (now links to user_infos)
CREATE TABLE group_memberships (
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_info_id uuid NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE,
  PRIMARY KEY (group_id, user_info_id)
);