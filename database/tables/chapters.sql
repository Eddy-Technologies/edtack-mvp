-- Chapter Table
-- Represents the hierarchical educational content structure (main topics, sub-strands, sub-topics)
-- Recursive structure with parent_id referencing the same table
CREATE TABLE chapters (
  name VARCHAR(100) PRIMARY KEY,
  display_name VARCHAR(100) NOT NULL,
  subject_id VARCHAR(100) NOT NULL REFERENCES subjects(name) ON DELETE CASCADE,
  parent_id VARCHAR(100) REFERENCES chapters(name) ON DELETE CASCADE, -- NULL for top-level
  level INT NOT NULL,
  description TEXT DEFAULT NULL,
  CONSTRAINT unique_chapter_per_subject UNIQUE (subject_id, name) -- Ensure unique chapter names within the same subject
);