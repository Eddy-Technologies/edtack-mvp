CREATE TABLE chat_messages (
                               id BIGSERIAL PRIMARY KEY,
                               thread_id UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
                               sender UUID NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE,
                               type VARCHAR(20) NOT NULL,
                               content TEXT NOT NULL,
                               created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_thread_id ON chat_messages(thread_id);
