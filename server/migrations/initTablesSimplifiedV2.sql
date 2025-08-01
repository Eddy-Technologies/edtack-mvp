-- Simplified version of the database schema for the app.
-- Focuses mainly on login, user management, and question/answer tracking.
-- This version does not include payment, wallet, or leaderboard features.
-- IMPORTANT: This script assumes you are running it on a FRESH Supabase database
-- or that you have backed up any existing data you wish to preserve.
-- It will drop all specified tables, views, functions, and triggers before recreating them.

-- Drop views first (important for dependencies)
DROP VIEW IF EXISTS all_users CASCADE;

-- Drop tables (in dependency order - reverse creation order)
DROP TABLE IF EXISTS user_question_answers CASCADE;
DROP TABLE IF EXISTS user_question_attempts CASCADE;
DROP TABLE IF EXISTS question_correct_answers CASCADE;
DROP TABLE IF EXISTS question_options CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS syllabus CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS class_group_constraints CASCADE;
DROP TABLE IF EXISTS family_group_constraints CASCADE;
DROP TABLE IF EXISTS group_memberships CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS parent_child CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS user_phones CASCADE;
DROP TABLE IF EXISTS user_emails CASCADE;
DROP TABLE IF EXISTS user_infos CASCADE; -- Must drop before app_users/auth.users if it references them
DROP TABLE IF EXISTS level_types CASCADE;
DROP TABLE IF EXISTS app_users CASCADE;

-- Drop functions and triggers (if needed)
DROP FUNCTION IF EXISTS prevent_cyclic_parenting CASCADE;
DROP FUNCTION IF EXISTS check_family_group_type CASCADE;
DROP FUNCTION IF EXISTS check_class_group_type CASCADE;
DROP FUNCTION IF EXISTS enforce_user_role_user_type CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- Drop indexes (if needed)
DROP INDEX IF EXISTS idx_user_infos_user_id CASCADE;
DROP INDEX IF EXISTS idx_user_infos_app_user_id CASCADE;
DROP INDEX IF EXISTS idx_correct_answers_question_order CASCADE;
DROP INDEX IF EXISTS idx_user_attempted_question_answers_order CASCADE;
DROP INDEX IF EXISTS idx_user_emails_primary_unique CASCADE;
DROP INDEX IF EXISTS idx_user_phones_primary_unique CASCADE;

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- CORE USER AND AUTHENTICATION TABLES
--------------------------------------------------------------------------------

-- Custom App Users Table (for users without email/phone, stores credentials only)
CREATE TABLE app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  encrypted_password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roles Table
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  role_name TEXT NOT NULL CHECK (role_name IN ('PARENT', 'TEACHER', 'STUDENT'))
);

-- Level Types Table
CREATE TABLE level_types (
  level_type VARCHAR(50) PRIMARY KEY,
  description VARCHAR(255) DEFAULT NULL
);

-- User Infos Table (Centralized Profile Data, links to EITHER auth.users OR app_users)
CREATE TABLE user_infos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE, -- Link to Supabase Auth user
  app_user_id uuid UNIQUE REFERENCES app_users(id) ON DELETE CASCADE, -- Link to custom app_user
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- Enforce that a profile is linked to exactly one authentication type
  CHECK (
    (user_id IS NOT NULL AND app_user_id IS NULL)
    OR (user_id IS NULL AND app_user_id IS NOT NULL)
  )
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
CREATE UNIQUE INDEX idx_user_infos_user_id ON user_infos(user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX idx_user_infos_app_user_id ON user_infos(app_user_id) WHERE app_user_id IS NOT NULL;

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

-- User Roles Table (Many-to-Many, now links to user_infos)
CREATE TABLE user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_info_id uuid NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE,
  role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  UNIQUE (user_info_id, role_id) -- A user_info can only have one of each role
);

-- Trigger function to enforce user role rules based on user_infos links
-- Ensures 'parent'/'teacher' roles are only assigned to profiles linked to auth.users
CREATE OR REPLACE FUNCTION enforce_user_role_user_type()
RETURNS TRIGGER AS $$
DECLARE
  role_name_val TEXT;
  linked_user_id UUID;
  linked_app_user_id UUID;
BEGIN
  RAISE LOG '[enforce_user_role_user_type] user_info_id: %, role_id: %', NEW.user_info_id, NEW.role_id;

  -- Check if role_id is NULL first
  IF NEW.role_id IS NULL THEN
    RAISE EXCEPTION '[enforce_user_role_user_type] role_id is NULL';
  END IF;

  -- Check if role exists - EXPLICITLY use public schema
  SELECT role_name INTO role_name_val FROM public.roles WHERE id = NEW.role_id;

  IF role_name_val IS NULL THEN
    RAISE EXCEPTION '[enforce_user_role_user_type] Role with id % not found in roles table. Available roles: %',
      NEW.role_id,
      (SELECT string_agg(id::text || ':' || role_name, ', ') FROM public.roles);
  END IF;

  RAISE LOG 'Processing role: %', role_name_val;

  -- Fetch the linked auth.users.id and app_users.id from user_infos
  SELECT user_id, app_user_id INTO linked_user_id, linked_app_user_id
  FROM public.user_infos WHERE id = NEW.user_info_id;

  RAISE LOG 'Getting user_id: %, app_user_id: %', linked_user_id, linked_app_user_id;

  IF role_name_val IN ('PARENT', 'TEACHER') THEN
    -- Parents and Teachers must be linked to auth.users (email/phone)
    IF linked_user_id IS NULL OR linked_app_user_id IS NOT NULL THEN
      RAISE EXCEPTION '[enforce_user_role_user_type] Roles "parent" and "teacher" must be assigned to profiles linked to auth.users (user_id only)';
    END IF;
  ELSIF role_name_val = 'STUDENT' THEN
    -- Students can be linked to either auth.users or app_users.
    NULL; -- No additional check needed here for student
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION '[enforce_user_role_user_type] Failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enforce_user_role_user_type
BEFORE INSERT OR UPDATE ON user_roles
FOR EACH ROW EXECUTE FUNCTION enforce_user_role_user_type();

-- Parent-Child Relationship Table (both parent and child link to user_infos)
CREATE TABLE parent_child (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_info_id uuid NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE, -- Parent is a user_infos user
  child_user_info_id uuid NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE, -- Child is a user_infos user
  UNIQUE (parent_user_info_id, child_user_info_id) -- A parent-child pair is unique
);

-- Trigger function to prevent cyclic parenting and ensure parent is auth.users
CREATE OR REPLACE FUNCTION prevent_cyclic_parenting()
RETURNS TRIGGER AS $$
DECLARE
  parent_auth_id UUID;
  child_auth_id UUID;
  child_app_auth_id UUID;
BEGIN
  -- Fetch auth.users.id for the parent (enforce parent is auth.users)
  SELECT user_id INTO parent_auth_id
  FROM user_infos WHERE id = NEW.parent_user_info_id;

  IF parent_auth_id IS NULL THEN
    RAISE EXCEPTION 'Parent must be an email/phone-based user (linked to auth.users).';
  END IF;

  -- Fetch auth.users.id and app_users.id for the child
  SELECT user_id, app_user_id INTO child_auth_id, child_app_auth_id
  FROM user_infos WHERE id = NEW.child_user_info_id;

  -- A user cannot be their own parent (direct link check)
  IF NEW.parent_user_info_id = NEW.child_user_info_id THEN
    RAISE EXCEPTION 'A user cannot be their own parent.';
  END IF;

  -- Simplified cyclic parenting check:
  -- This check is complex with mixed auth types. A full, robust cycle check
  -- would require more advanced graph traversal logic considering both user_id and app_user_id paths.
  -- For this schema, we'll check if the child's user_info_id is an ancestor of the parent's user_info_id.
  IF EXISTS (
    WITH RECURSIVE ancestry AS (
      SELECT pc.parent_user_info_id AS ancestor_info_id, pc.child_user_info_id AS current_child_info_id
      FROM parent_child pc
      WHERE pc.parent_user_info_id = NEW.child_user_info_id -- Start from potential child's parents

      UNION ALL

      SELECT pc_rec.parent_user_info_id, pc_rec.child_user_info_id
      FROM parent_child pc_rec
      JOIN ancestry a ON pc_rec.child_user_info_id = a.ancestor_info_id -- Recursively find ancestors
    )
    SELECT 1 FROM ancestry WHERE ancestor_info_id = NEW.parent_user_info_id
  ) THEN
    RAISE EXCEPTION 'Cyclic parenting detected.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_cyclic_parenting
BEFORE INSERT OR UPDATE ON parent_child
FOR EACH ROW EXECUTE FUNCTION prevent_cyclic_parenting();

-- Groups Table
CREATE TABLE groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name VARCHAR(100) NOT NULL,
  group_type TEXT NOT NULL CHECK (group_type IN ('class', 'family'))
);

-- Group Memberships Table (now links to user_infos)
CREATE TABLE group_memberships (
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_info_id uuid NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE,
  PRIMARY KEY (group_id, user_info_id)
);

-- Family Group Constraints (parent_user_info_id now references user_infos)
CREATE TABLE family_group_constraints (
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  parent_user_info_id uuid NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE, -- Parent is a user_infos user
  PRIMARY KEY (group_id, parent_user_info_id),
  UNIQUE (parent_user_info_id, group_id)
);

-- Trigger function to enforce family group type and parent role
CREATE OR REPLACE FUNCTION check_family_group_type()
RETURNS TRIGGER AS $$
DECLARE
  linked_user_id UUID;
  linked_app_user_id UUID;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM groups WHERE id = NEW.group_id AND group_type = 'family'
  ) THEN
    RAISE EXCEPTION 'group_id % is not a family group', NEW.group_id;
  END IF;

  -- Ensure the parent_user_info_id corresponds to an auth.users user (parent role constraint)
  SELECT user_id, app_user_id INTO linked_user_id, linked_app_user_id
  FROM user_infos WHERE id = NEW.parent_user_info_id;

  IF linked_user_id IS NULL OR linked_app_user_id IS NOT NULL THEN
    RAISE EXCEPTION 'Parent in family group must be an email/phone-based user (linked to auth.users).';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_family_group_type
BEFORE INSERT OR UPDATE ON family_group_constraints
FOR EACH ROW EXECUTE FUNCTION check_family_group_type();

-- Class Group Constraints Table (teacher_user_info_id now references user_infos)
CREATE TABLE class_group_constraints (
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  teacher_user_info_id uuid NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE, -- Teacher is a user_infos user
  PRIMARY KEY (group_id, teacher_user_info_id)
);

-- Trigger function to enforce class group type and teacher role
CREATE OR REPLACE FUNCTION check_class_group_type()
RETURNS TRIGGER AS $$
DECLARE
  linked_user_id UUID;
  linked_app_user_id UUID;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM groups WHERE id = NEW.group_id AND group_type = 'class'
  ) THEN
    RAISE EXCEPTION 'group_id % is not a class group', NEW.group_id;
  END IF;

  -- Ensure the teacher_user_info_id corresponds to an auth.users user (teacher role constraint)
  SELECT user_id, app_user_id INTO linked_user_id, linked_app_user_id
  FROM user_infos WHERE id = NEW.teacher_user_info_id;

  IF linked_user_id IS NULL OR linked_app_user_id IS NOT NULL THEN
    RAISE EXCEPTION 'Teacher in class group must be an email/phone-based user (linked to auth.users).';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_class_group_type
BEFORE INSERT OR UPDATE ON class_group_constraints
FOR EACH ROW EXECUTE FUNCTION check_class_group_type();

-- Subject Table
-- Represents the subject structure (e.g. Mathematics, Science)
CREATE TABLE subjects (
  name VARCHAR(100) PRIMARY KEY,       -- e.g. 'MY_BASIC_MATH'
  subject_name VARCHAR(100) NOT NULL,  -- e.g. 'Mathematics'
  display_name VARCHAR(100) NOT NULL,  -- e.g. 'Malaysia PSLE Standard Math'
  description TEXT DEFAULT NULL,
  country_code VARCHAR(2) DEFAULT 'SG'
);

-- Syllabus Table
-- Represents the syllabus structure (main topics, sub-strands, sub-topics)
-- Recursive structure with parent_id referencing the same table
CREATE TABLE syllabus (
  name VARCHAR(100) PRIMARY KEY,
  display_name VARCHAR(100) NOT NULL,
  subject_id VARCHAR(100) NOT NULL REFERENCES subjects(name) ON DELETE CASCADE,
  parent_id VARCHAR(100) REFERENCES syllabus(name) ON DELETE CASCADE, -- NULL for top-level
  level INT NOT NULL,
  description TEXT DEFAULT NULL
);

-- Questions Table
CREATE TABLE questions (
  id uuid PRIMARY KEY,
  syllabus_id VARCHAR(100) NOT NULL REFERENCES syllabus(name) ON DELETE CASCADE, -- Link to syllabus
  parent_question_id uuid REFERENCES questions(id) ON DELETE CASCADE, -- NULL for top-level questions
  subquestion_order INT DEFAULT NULL, -- Order among siblings (sub-parts)
  part_label VARCHAR(20) DEFAULT NULL, -- e.g., 'A)', 'ii)', '1)'
  type TEXT NOT NULL CHECK (type IN ('parent', 'mcq', 'open', 'boolean', 'draw', 'fill')),
  title VARCHAR(255) NOT NULL,
  question TEXT NOT NULL,
  explanation TEXT DEFAULT NULL,
  question_image_url VARCHAR(255) DEFAULT NULL, -- S3 url temp
  explanation_image_url VARCHAR(255) DEFAULT NULL, -- S3 url temp
  source_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Time of question source to indicate freshness
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  source_name TEXT NOT NULL
);

-- Options Table
CREATE TABLE question_options (
  id uuid PRIMARY KEY,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_text VARCHAR(255) DEFAULT NULL,
  image_url VARCHAR(255) DEFAULT NULL,
  CHECK (
    option_text IS NOT NULL OR image_url IS NOT NULL
  )
);

-- Correct Answers Table
CREATE TABLE question_correct_answers (
  id uuid PRIMARY KEY,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_id uuid REFERENCES question_options(id) ON DELETE CASCADE,
  answer_text TEXT DEFAULT NULL,
  answer_boolean BOOLEAN DEFAULT NULL,
  answer_draw_file VARCHAR(255) DEFAULT NULL,
  image_url VARCHAR(255) DEFAULT NULL, -- S3 url temp
  order_index INT NOT NULL, -- Order of this option in the answer used to sort
  CHECK (
    option_id IS NOT NULL
    OR answer_text IS NOT NULL
    OR answer_boolean IS NOT NULL
    OR answer_draw_file IS NOT NULL
  )
);

-- Stores the history of all user answers for all questions (all attempts) - now links to user_infos
CREATE TABLE user_question_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_info_id uuid NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  attempt_number INT DEFAULT 1,
  submitted_at TIMESTAMP NOT NULL,
  duration_seconds INT NOT NULL,
  score DECIMAL(5, 2) DEFAULT NULL,
  is_correct BOOLEAN DEFAULT NULL
);

-- Stores the history of all user answers for all questions (all attempts)
CREATE TABLE user_question_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_question_attempts_id uuid NOT NULL REFERENCES user_question_attempts(id) ON DELETE CASCADE,
  option_id uuid NOT NULL REFERENCES question_options(id) ON DELETE CASCADE,
  option_text VARCHAR(255) DEFAULT NULL,   -- snapshot
  option_image VARCHAR(255) DEFAULT NULL,  -- snapshot
  answer_text TEXT DEFAULT NULL,
  answer_boolean BOOLEAN DEFAULT NULL,
  answer_draw_file VARCHAR(255) DEFAULT NULL,
  order_index INT NOT NULL -- Order of this option in the answer used to sort
);

-- Indexes of performance as answers has order
CREATE INDEX idx_correct_answers_question_order
ON question_correct_answers (question_id, order_index);

CREATE INDEX idx_user_attempted_question_answers_order
ON user_question_answers (user_question_attempts_id, order_index);

-- VIEWS (Placed after core tables they depend on, before optional modules)
--------------------------------------------------------------------------------

-- all_users View (Now joins user_infos to get profile data)
CREATE OR REPLACE VIEW all_users AS
SELECT
  ui.id AS user_info_id,
  ui.first_name,
  ui.last_name,
  ui.gender,
  ui.level_type,
  ui.payment_customer_id
  CASE
    WHEN ui.user_id IS NOT NULL THEN 'auth_' || ui.user_id::text
    WHEN ui.app_user_id IS NOT NULL THEN 'app_' || ui.app_user_id::text
    ELSE NULL
  END AS prefixed_auth_id,
  CASE
    WHEN ui.user_id IS NOT NULL THEN au.email
    ELSE NULL
  END AS email,
  CASE
    WHEN ui.app_user_id IS NOT NULL THEN appu.username
    ELSE NULL
  END AS username,
  CASE
    WHEN ui.user_id IS NOT NULL THEN 'auth'
    WHEN ui.app_user_id IS NOT NULL THEN 'app'
    ELSE NULL
  END AS auth_source,
  ui.created_at,
  ui.updated_at
FROM user_infos ui
LEFT JOIN auth.users au ON ui.user_id = au.id
LEFT JOIN app_users appu ON ui.app_user_id = appu.id;

-- Leaderboard View (No changes needed, as it doesn't directly select these timestamps)
CREATE OR REPLACE VIEW leaderboard AS
WITH combined_attempts AS (
  SELECT
    uq.user_info_id,
    COUNT(uq.id) AS total_questions_attempted,
    SUM(uq.duration_seconds) AS total_time_spent,
    AVG(uq.duration_seconds) AS avg_time_per_question,
    COALESCE(SUM(uq.score), 0) AS total_score
  FROM user_question_attempts uq
  GROUP BY uq.user_info_id
)
SELECT
  ui.id AS user_info_id,
  ui.first_name,
  ui.last_name,
  ui.level_type,
  ca.total_questions_attempted,
  ca.total_time_spent,
  ca.avg_time_per_question,
  ca.total_score,
  RANK() OVER (
    ORDER BY ca.total_questions_attempted DESC, ca.total_score DESC, ca.avg_time_per_question ASC
  ) AS rank
FROM user_infos ui
JOIN combined_attempts ca ON ui.id = ca.user_info_id
WHERE ui.is_active = TRUE -- Only include active users in leaderboard
ORDER BY rank;

-- -- Function to handle new user creation
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS TRIGGER AS $$
-- DECLARE
--   v_role_id INT;
--   v_user_info_id uuid;
-- BEGIN
--   RAISE LOG 'Trigger started for user_id: %', NEW.id;  -- Print start
--   RAISE LOG 'Storing raw_user_meta_data: %', New.raw_user_meta_data;  -- Print start

--   SELECT id INTO v_role_id FROM public.roles WHERE role_name = NEW.raw_user_meta_data ->> 'user_role';
--   RAISE LOG '[handle_new_user] Selected role_id: % for role: %', v_role_id, NEW.raw_user_meta_data ->> 'user_role';  -- Print variable

--   INSERT INTO public.user_infos (user_id, first_name, last_name, level_type, onboarding_completed, is_active)
--   VALUES (NEW.id, NEW.raw_user_meta_data ->> 'first_name', NEW.raw_user_meta_data ->> 'last_name', NEW.raw_user_meta_data ->> 'student_level', true, true)
--   RETURNING id INTO v_user_info_id;

--   RAISE LOG '[handle_new_user] Inserted user_infos with id: %', v_user_info_id;  -- Print after insert

--   INSERT INTO public.user_emails (user_info_id, email, is_primary)
--   VALUES (v_user_info_id, NEW.raw_user_meta_data ->> 'email', true);
--   RAISE LOG '[handle_new_user] Inserted user_emails with email: %', NEW.raw_user_meta_data ->> 'email';  -- Print after insert

--   INSERT INTO public.user_roles (user_info_id, role_id)
--   VALUES (v_user_info_id, v_role_id);
--   RAISE LOG '[handle_new_user] Inserted user_roles with role_id: %', v_role_id;  -- Print after insert

--   RETURN NEW;
-- EXCEPTION WHEN OTHERS THEN
--   RAISE EXCEPTION '[handle_new_user] Failed to create user_infos: %', SQLERRM;  -- This will log the error
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- CREATE OR REPLACE TRIGGER on_auth_user_created
-- AFTER INSERT ON auth.users
-- FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();