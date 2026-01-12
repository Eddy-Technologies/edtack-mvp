-- Add invited_email column for unregistered user invitations
-- Make user_info_id nullable to support email-only invitations

ALTER TABLE group_members ALTER COLUMN user_info_id DROP NOT NULL;

ALTER TABLE group_members ADD COLUMN invited_email VARCHAR(255);

-- Must have either user_info_id OR invited_email
ALTER TABLE group_members ADD CONSTRAINT chk_user_or_email
  CHECK (user_info_id IS NOT NULL OR invited_email IS NOT NULL);

-- Index for email lookups
CREATE INDEX idx_group_members_invited_email ON group_members(invited_email) WHERE invited_email IS NOT NULL;
