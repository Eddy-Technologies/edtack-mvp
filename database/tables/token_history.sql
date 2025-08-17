-- Token History Table (Track AI token usage by users)
CREATE TABLE token_history (
  id SERIAL PRIMARY KEY,
  user_infos_id uuid REFERENCES user_infos(id) ON DELETE CASCADE, -- Reference to user_infos table but optional for now 
  thread_id VARCHAR(255) NOT NULL,
  module_name VARCHAR(100) NOT NULL,
  query TEXT,
  token_count INTEGER NOT NULL,
  query_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Optional fields for detailed tracking
  provider VARCHAR(50),
  model VARCHAR(100),
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  response_time_ms INTEGER
);

-- Indexes for token_history for faster lookups
CREATE INDEX idx_token_history_user_infos_id ON token_history(user_infos_id);
CREATE INDEX idx_token_history_thread_id ON token_history(thread_id);