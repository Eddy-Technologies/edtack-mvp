-- User Emails Table
CREATE TABLE user_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_info_id uuid NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE,
  email VARCHAR(100) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Partial unique index to ensure only one primary email per user_info_id
CREATE UNIQUE INDEX idx_user_emails_primary_unique
ON user_emails (user_info_id)
WHERE is_primary = TRUE;