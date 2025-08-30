CREATE TABLE chat_messages (
                               id BIGSERIAL PRIMARY KEY,
                               thread_id UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
                               sender BIGINT,
                               type VARCHAR(20) NOT NULL,
                               text TEXT NOT NULL,
                               created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_thread_id ON chat_messages(thread_id);
