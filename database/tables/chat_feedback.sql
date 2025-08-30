CREATE TABLE chat_feedback (
                               id BIGSERIAL PRIMARY KEY,
                               message_id BIGINT NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
                               user_id BIGINT NOT NULL, -- who gave feedback
                               feedback_type VARCHAR(10) NOT NULL CHECK (feedback_type IN ('like', 'dislike')),
                               created_at TIMESTAMP DEFAULT NOW(),
                               UNIQUE (message_id, user_id) -- one feedback per user per message
);

CREATE INDEX idx_chat_feedback_message_id ON chat_feedback(message_id);
CREATE INDEX idx_chat_feedback_user_id ON chat_feedback(user_id);
