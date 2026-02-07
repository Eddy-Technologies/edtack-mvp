CREATE TABLE threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_infos_id UUID REFERENCES user_infos(id) ON DELETE CASCADE, -- who owns this thread (nullable for anonymous users)
  title TEXT,
  subject VARCHAR(100), -- subject for the thread to load correct character
  is_anonymous BOOLEAN DEFAULT FALSE,
  anon_session_id VARCHAR(36), -- session ID for anonymous users
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_threads_user_infos_id ON threads(user_infos_id);
CREATE INDEX idx_threads_anon_session_id ON threads(anon_session_id) WHERE anon_session_id IS NOT NULL;
