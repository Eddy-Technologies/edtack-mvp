-- Notes Table
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_infos(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    tags TEXT[],
    is_pinned BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX idx_notes_is_pinned ON notes(is_pinned) WHERE is_pinned = true;
CREATE INDEX idx_notes_is_archived ON notes(is_archived) WHERE is_archived = false;

-- Full text search index
CREATE INDEX idx_notes_search ON notes USING gin(to_tsvector('english', title || ' ' || content));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_notes_updated_at_trigger
BEFORE UPDATE ON notes
FOR EACH ROW
EXECUTE FUNCTION update_notes_updated_at();

-- Function for searching notes
CREATE OR REPLACE FUNCTION search_notes(
    p_user_id UUID,
    p_search_term TEXT DEFAULT NULL,
    p_category VARCHAR(100) DEFAULT NULL,
    p_tags TEXT[] DEFAULT NULL,
    p_archived BOOLEAN DEFAULT false
)
RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    content TEXT,
    category VARCHAR(100),
    tags TEXT[],
    is_pinned BOOLEAN,
    is_archived BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id,
        n.title,
        n.content,
        n.category,
        n.tags,
        n.is_pinned,
        n.is_archived,
        n.created_at,
        n.updated_at
    FROM notes n
    WHERE n.user_id = p_user_id
    AND n.is_archived = p_archived
    AND (p_search_term IS NULL OR 
         to_tsvector('english', n.title || ' ' || n.content) @@ plainto_tsquery('english', p_search_term))
    AND (p_category IS NULL OR n.category = p_category)
    AND (p_tags IS NULL OR n.tags && p_tags)
    ORDER BY n.is_pinned DESC, n.created_at DESC;
END;
$$ LANGUAGE plpgsql;