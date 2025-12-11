CREATE TABLE thread_messages (
                               id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                               thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
                               sender UUID DEFAULT NULL REFERENCES user_infos(id) ON DELETE CASCADE,
                               type VARCHAR(20) NOT NULL,
                               content TEXT NOT NULL,
                               created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_thread_messages_thread_id ON thread_messages(thread_id);
CREATE INDEX idx_thread_messages_sender ON thread_messages(sender);
