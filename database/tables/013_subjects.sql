-- Subject Table
-- Represents the subject structure (e.g. Mathematics, Science)
CREATE TABLE subjects (
  name VARCHAR(100) PRIMARY KEY,       -- e.g. 'MY_BASIC_MATH'
  subject_name VARCHAR(100) NOT NULL,  -- e.g. 'Mathematics'
  display_name VARCHAR(100) NOT NULL,  -- e.g. 'Malaysia PSLE Standard Math'
  description TEXT DEFAULT NULL,
  country_code VARCHAR(2) DEFAULT 'SG'
);