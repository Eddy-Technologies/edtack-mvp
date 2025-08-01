CREATE TABLE groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  description text,
  group_type text,
  is_active boolean DEFAULT true,
  created_by uuid NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);