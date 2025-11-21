-- Stores the history of all user answers for all questions (all attempts) - now links to user_infos
CREATE TABLE user_question_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_info_id uuid NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  attempt_number INT DEFAULT 1,
  submitted_at TIMESTAMP NOT NULL,
  duration_seconds INT NOT NULL,
  score DECIMAL(5, 2) DEFAULT NULL,
  is_correct BOOLEAN DEFAULT NULL,
  max_score DECIMAL(5, 2) DEFAULT NULL,
  marking_status TEXT CHECK (marking_status IN ('CORRECT', 'PARTIALLY_CORRECT', 'INCORRECT')) DEFAULT NULL,
  feedback_positive TEXT DEFAULT NULL,
  feedback_gaps TEXT DEFAULT NULL,
  feedback_improvement TEXT DEFAULT NULL,
  key_concepts_assessed TEXT[] DEFAULT NULL,
  marking_rationale TEXT DEFAULT NULL
);

-- Add indexes for marking analytics and AI operations
CREATE INDEX IF NOT EXISTS idx_user_question_attempts_marking_status
ON user_question_attempts(marking_status) WHERE marking_status IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_question_attempts_scores
ON user_question_attempts(score, max_score) WHERE max_score IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_question_attempts_user_status
ON user_question_attempts(user_info_id, marking_status);