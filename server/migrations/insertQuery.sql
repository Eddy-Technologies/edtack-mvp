INSERT INTO subjects (name, subject_name, display_name, description, country_code) VALUES
  -- Primary School
  ('SG_PSLE_STANDARD_MATH', 'Mathematics', 'Singapore PSLE Standard Math', 'Standard Math for Singapore PSLE', 'SG'),
  ('SG_P1_STANDARD_MATH', 'Mathematics', 'Singapore P1 Standard Math', 'Standard Math for Singapore P1', 'SG'),
  ('SG_P2_STANDARD_MATH', 'Mathematics', 'Singapore P2 Standard Math', 'Standard Math for Singapore P2', 'SG'),
  ('SG_P3_STANDARD_MATH', 'Mathematics', 'Singapore P3 Standard Math', 'Standard Math for Singapore P3', 'SG'),
  ('SG_P4_STANDARD_MATH', 'Mathematics', 'Singapore P4 Standard Math', 'Standard Math for Singapore P4', 'SG'),
  ('SG_P5_STANDARD_MATH', 'Mathematics', 'Singapore P5 Standard Math', 'Standard Math for Singapore P5', 'SG'),
  ('SG_P5_FOUNDATION_MATH', 'Mathematics', 'Singapore P5 Foundation Math', 'Foundation Math for Singapore P5', 'SG'),
  ('SG_P6_STANDARD_MATH', 'Mathematics', 'Singapore P6 Standard Math', 'Standard Math for Singapore P6', 'SG'),
  ('SG_P6_FOUNDATION_MATH', 'Mathematics', 'Singapore P6 Foundation Math', 'Foundation Math for Singapore P6', 'SG'),
  ('SG_PSLE_STANDARD_ENG', 'English', 'Singapore PSLE Standard English', 'Standard English for Singapore PSLE', 'SG'),
  ('SG_P1_STANDARD_ENG', 'English', 'Singapore P1 Standard English', 'Standard English for Singapore P1', 'SG'),
  ('SG_P2_STANDARD_ENG', 'English', 'Singapore P2 Standard English', 'Standard English for Singapore P2', 'SG'),
  ('SG_P3_STANDARD_ENG', 'English', 'Singapore P3 Standard English', 'Standard English for Singapore P3', 'SG'),
  ('SG_P4_STANDARD_ENG', 'English', 'Singapore P4 Standard English', 'Standard English for Singapore P4', 'SG'),
  ('SG_P5_STANDARD_ENG', 'English', 'Singapore P5 Standard English', 'Standard English for Singapore P5', 'SG'),
  ('SG_P6_STANDARD_ENG', 'English', 'Singapore P6 Standard English', 'Standard English for Singapore P6', 'SG');

-- Insert predefined level_types
INSERT INTO level_types (level_type, description) VALUES
('PRIMARY_1', 'Primary 1'),
('PRIMARY_2', 'Primary 2'),
('PRIMARY_3', 'Primary 3'),
('PRIMARY_4', 'Primary 4'),
('PRIMARY_5', 'Primary 5'),
('PRIMARY_6', 'Primary 6'),
('SECONDARY_1', 'Secondary 1'),
('SECONDARY_2', 'Secondary 2'),
('SECONDARY_3', 'Secondary 3'),
('SECONDARY_4', 'Secondary 4'),
('SECONDARY_5', 'Secondary 5'),
('JUNIOR_COLLEGE_1', 'Junior College 1'),
('JUNIOR_COLLEGE_2', 'Junior College 2');

-- Insert predefined roles
Insert INTO roles(role_name) VALUES
('PARENT'),
('TEACHER'),
('STUDENT');
