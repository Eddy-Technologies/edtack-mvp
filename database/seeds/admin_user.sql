-- Default Admin User Seed Data
-- This creates a default admin user for testing and initial setup
-- Username: admin@edtack.com
-- Password: Admin123!

-- Insert default admin user into auth.users (this would normally be done via auth signup)
-- Note: In production, this should be done through proper auth signup process
-- This is for development/testing purposes only

-- Create user_info record for admin
INSERT INTO user_infos (
  id,
  user_id,
  email,
  first_name,
  last_name,
  gender,
  address,
  country_code,
  postal_code,
  onboarding_completed,
  is_active,
  created_at,
  updated_at
) VALUES (
  'admin-user-id-12345678-1234-1234-1234-123456789012'::uuid,
  'admin-auth-id-12345678-1234-1234-1234-123456789012'::uuid, -- This would be the actual auth.users id
  'admin@edtack.com',
  'Admin',
  'User',
  'Other',
  '123 Admin Street, Singapore',
  'SG',
  '123456',
  true,
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Assign admin role to the user
INSERT INTO user_roles (
  id,
  user_info_id,
  role_id,
  role_name
) VALUES (
  gen_random_uuid(),
  'admin-user-id-12345678-1234-1234-1234-123456789012'::uuid,
  1, -- ADMIN role id
  'ADMIN'
) ON CONFLICT (user_info_id, role_id) DO NOTHING;

-- Create user credits record for admin
INSERT INTO user_credits (
  user_info_id,
  credit,
  updated_at
) VALUES (
  'admin-user-id-12345678-1234-1234-1234-123456789012'::uuid,
  10000, -- Give admin user lots of credits
  NOW()
) ON CONFLICT (user_info_id) DO UPDATE SET
  credit = EXCLUDED.credit,
  updated_at = EXCLUDED.updated_at;