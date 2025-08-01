-- Groups Table
CREATE TABLE groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name VARCHAR(100) NOT NULL,
  group_type TEXT NOT NULL CHECK (group_type IN ('class', 'family'))
);