-- Add file_attachments column to store file metadata with messages
-- Structure: [{ id, name, size, type, uploadedAt, status }]
ALTER TABLE thread_messages
ADD COLUMN file_attachments JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN thread_messages.file_attachments IS 'JSON array of file attachment metadata: [{id, name, size, type, uploadedAt, status}]';
