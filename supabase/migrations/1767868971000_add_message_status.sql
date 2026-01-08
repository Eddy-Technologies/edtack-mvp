-- Add status column to thread_messages for tracking message delivery state
-- Status values: 'sending', 'sent', 'failed', 'cancelled'
-- NULL means legacy message (treated as 'sent')

ALTER TABLE thread_messages
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT NULL;

-- Add index for querying failed messages
CREATE INDEX IF NOT EXISTS idx_thread_messages_status ON thread_messages(status) WHERE status IS NOT NULL;

-- Comment for documentation
COMMENT ON COLUMN thread_messages.status IS 'Message delivery status: sending, sent, failed, cancelled. NULL = legacy (treated as sent)';
