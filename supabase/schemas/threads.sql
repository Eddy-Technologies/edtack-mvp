CREATE TABLE threads (
                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              user_infos_id UUID NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE, -- who owns this thread
                              title TEXT,
                              subject VARCHAR(100), -- subject for the thread to load correct character
                              created_at TIMESTAMP DEFAULT NOW(),
                              updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_threads_user_infos_id ON threads(user_infos_id);
