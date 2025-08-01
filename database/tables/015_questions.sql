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