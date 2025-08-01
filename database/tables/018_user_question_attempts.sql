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