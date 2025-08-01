-- User Infos Table (Centralized Profile Data, links to auth.users only)
CREATE TABLE user_infos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE, -- Link to Supabase Auth user
  email VARCHAR(255) UNIQUE NOT NULL, -- Email is unique across all profiles
  contact_number VARCHAR(20) DEFAULT NULL, -- Contact number can be null
  first_name VARCHAR(100) DEFAULT NULL,
  last_name VARCHAR(100) DEFAULT NULL,
  gender VARCHAR(10) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  country_code VARCHAR(2) DEFAULT 'SG',
  postal_code VARCHAR(10) DEFAULT NULL,
  date_of_birth DATE DEFAULT NULL,
  level_type VARCHAR(50) REFERENCES level_types(level_type) ON DELETE CASCADE,
  profile_picture_url VARCHAR(255) DEFAULT NULL,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  payment_customer_id VARCHAR(100) DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE user_infos ENABLE ROW LEVEL SECURITY; -- Enable RLS for user_infos

-- Trigger function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call update_updated_at_column on user_infos table
CREATE TRIGGER trg_user_infos_updated_at
BEFORE UPDATE ON user_infos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for user_infos for faster lookups
CREATE UNIQUE INDEX idx_user_infos_user_id ON user_infos(user_id);
CREATE UNIQUE INDEX idx_user_infos_email ON user_infos(email);