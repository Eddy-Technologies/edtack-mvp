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

-- Index for performance as answers has order
CREATE INDEX idx_user_attempted_question_answers_order
ON user_question_answers (user_question_attempts_id, order_index);