-- User Phones Table
CREATE TABLE user_phones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_info_id uuid NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE,
  phone_number VARCHAR(15) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Partial unique index to ensure only one primary phone per user_info_id
CREATE UNIQUE INDEX idx_user_phones_primary_unique
ON user_phones (user_info_id)
WHERE is_primary = TRUE;