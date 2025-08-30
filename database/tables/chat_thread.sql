CREATE TABLE chat_threads (
                              id BIGSERIAL PRIMARY KEY,
                              user_id BIGINT NOT NULL, -- who owns this thread
                              title TEXT,
                              created_at TIMESTAMP DEFAULT NOW(),
                              updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chat_threads_user_id ON chat_threads(user_id);
