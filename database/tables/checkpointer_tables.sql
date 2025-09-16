-- LangGraph Checkpointer Tables for AsyncPostgresSaver
-- These tables store conversation state and checkpoints for AI conversations
-- Based on LangGraph requirements for persistent state management

-- 1. Main checkpoints table (stores conversation state)
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

-- 2. Checkpoint writes table (tracks state changes)
CREATE TABLE IF NOT EXISTS checkpoint_writes (
    thread_id TEXT NOT NULL,
    checkpoint_ns TEXT NOT NULL DEFAULT '',
    checkpoint_id TEXT NOT NULL,
    task_id TEXT NOT NULL,
    idx INTEGER NOT NULL,
    channel TEXT NOT NULL,
    type TEXT,
    value JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id, task_id, idx)
);

-- 3. Checkpoint blobs table (large data storage)
CREATE TABLE IF NOT EXISTS checkpoint_blobs (
    thread_id TEXT NOT NULL,
    checkpoint_ns TEXT NOT NULL DEFAULT '',
    channel TEXT NOT NULL,
    version TEXT NOT NULL,
    type TEXT NOT NULL,
    blob BYTEA,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (thread_id, checkpoint_ns, channel, version)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_checkpoints_thread_id ON checkpoints(thread_id);
CREATE INDEX IF NOT EXISTS idx_checkpoints_created_at ON checkpoints(created_at);
CREATE INDEX IF NOT EXISTS idx_checkpoint_writes_thread_id ON checkpoint_writes(thread_id);
CREATE INDEX IF NOT EXISTS idx_checkpoint_blobs_thread_id ON checkpoint_blobs(thread_id);