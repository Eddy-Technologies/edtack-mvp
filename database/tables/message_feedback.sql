CREATE TABLE message_feedback (
                               id BIGSERIAL PRIMARY KEY,
                               message_id UUID NOT NULL REFERENCES thread_messages(id) ON DELETE CASCADE,
                               user_infos_id UUID NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE, -- who gave feedback (using consistent UUID type)
                               feedback_type VARCHAR(10) NOT NULL CHECK (feedback_type IN ('like', 'dislike')),
                               category VARCHAR(50), -- optional category like 'accuracy', 'clarity', etc.
                               feedback_text TEXT, -- optional detailed feedback text
                               created_at TIMESTAMP DEFAULT NOW(),
                               UNIQUE (message_id, user_infos_id) -- one feedback per user per message
);

CREATE INDEX idx_message_feedback_message_id ON message_feedback(message_id);
CREATE INDEX idx_message_feedback_user_infos_id ON message_feedback(user_infos_id);
