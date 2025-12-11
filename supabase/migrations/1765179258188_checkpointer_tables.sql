-- PostgreSQL Checkpointer Tables for LangGraph AsyncPostgresSaver
-- These tables are required for persistent state management in the tutoring graph
-- Created: 2025-09-12

-- Drop existing tables to ensure clean setup with correct schema
DROP TABLE IF EXISTS checkpoint_blobs CASCADE;
DROP TABLE IF EXISTS checkpoint_writes CASCADE;
DROP TABLE IF EXISTS checkpoints CASCADE;

-- Table: checkpoints
-- Stores the main checkpoint data for each conversation thread
CREATE TABLE IF NOT EXISTS checkpoints (
    thread_id TEXT NOT NULL,
    checkpoint_ns TEXT NOT NULL DEFAULT '',
    checkpoint_id TEXT NOT NULL,
    parent_checkpoint_id TEXT,
    type TEXT,
    checkpoint JSONB NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_checkpoints_thread_id ON checkpoints(thread_id);
CREATE INDEX IF NOT EXISTS idx_checkpoints_created_at ON checkpoints(created_at);

-- Table: checkpoint_writes
-- Stores incremental writes/updates to checkpoints
CREATE TABLE IF NOT EXISTS checkpoint_writes (
    thread_id TEXT NOT NULL,
    checkpoint_ns TEXT NOT NULL DEFAULT '',
    checkpoint_id TEXT NOT NULL,
    task_id TEXT NOT NULL,
    idx INTEGER NOT NULL,
    task_path TEXT NOT NULL DEFAULT '',  -- Path to the task in the graph hierarchy (string format)
    channel TEXT NOT NULL,
    type TEXT,
    blob BYTEA,  -- Binary data for the write
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id, task_id, idx)
);

-- Add indexes for checkpoint_writes
CREATE INDEX IF NOT EXISTS idx_checkpoint_writes_thread_id ON checkpoint_writes(thread_id);
CREATE INDEX IF NOT EXISTS idx_checkpoint_writes_checkpoint_id ON checkpoint_writes(checkpoint_id);

-- Table: checkpoint_blobs
-- Stores binary data associated with checkpoints (e.g., serialized objects)
CREATE TABLE IF NOT EXISTS checkpoint_blobs (
    thread_id TEXT NOT NULL,
    checkpoint_ns TEXT NOT NULL DEFAULT '',
    channel TEXT NOT NULL,
    version TEXT NOT NULL,
    type TEXT NOT NULL,
    blob BYTEA,  -- Binary data
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (thread_id, checkpoint_ns, channel, version)
);

-- Add indexes for checkpoint_blobs
CREATE INDEX IF NOT EXISTS idx_checkpoint_blobs_thread_id ON checkpoint_blobs(thread_id);

-- Grant permissions (adjust user as needed)
-- GRANT ALL PRIVILEGES ON TABLE checkpoints TO your_app_user;
-- GRANT ALL PRIVILEGES ON TABLE checkpoint_writes TO your_app_user;
-- GRANT ALL PRIVILEGES ON TABLE checkpoint_blobs TO your_app_user;

-- Verify tables were created
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'checkpoints') THEN
        RAISE NOTICE 'Table checkpoints created successfully';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'checkpoint_writes') THEN
        RAISE NOTICE 'Table checkpoint_writes created successfully';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'checkpoint_blobs') THEN
        RAISE NOTICE 'Table checkpoint_blobs created successfully';
    END IF;
END $$;