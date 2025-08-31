CREATE TABLE chat_threads (
                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              user_infos_id UUID NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE, -- who owns this thread
                              title TEXT,
                              created_at TIMESTAMP DEFAULT NOW(),
                              updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chat_threads_user_infos_id ON chat_threads(user_infos_id);
