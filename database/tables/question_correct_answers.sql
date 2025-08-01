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

-- Index for performance as answers has order
CREATE INDEX idx_correct_answers_question_order
ON question_correct_answers (question_id, order_index);