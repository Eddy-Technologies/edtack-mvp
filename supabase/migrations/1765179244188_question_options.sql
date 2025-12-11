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