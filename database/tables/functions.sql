-- Database Functions and Extensions

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Note: The update_updated_at_column function is already created in 004_user_infos.sql
-- This file is reserved for any additional shared functions that might be needed in the future