-- Characters Table
CREATE TABLE characters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    voice_config JSONB DEFAULT '{}',
    animation_config JSONB DEFAULT '{}',
    personality_prompt TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for active characters
CREATE INDEX idx_characters_active ON characters(is_active) WHERE is_active = true;

-- Create index for display order
CREATE INDEX idx_characters_display_order ON characters(display_order);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_characters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_characters_updated_at_trigger
BEFORE UPDATE ON characters
FOR EACH ROW
EXECUTE FUNCTION update_characters_updated_at();