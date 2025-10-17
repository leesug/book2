-- Migration: Add guide history support to chapters table
-- Run this in your Supabase SQL Editor

-- Step 1: Add guide column for backward compatibility (if not exists)
ALTER TABLE chapters
ADD COLUMN IF NOT EXISTS guide TEXT;

-- Step 2: Add guide_history column to store array of guide versions
-- Structure: [{ content: string, created_at: timestamp, version: number }, ...]
ALTER TABLE chapters
ADD COLUMN IF NOT EXISTS guide_history JSONB DEFAULT '[]'::jsonb;

-- Step 3: Add current_guide_version column to track which version is currently displayed
ALTER TABLE chapters
ADD COLUMN IF NOT EXISTS current_guide_version INTEGER DEFAULT 0;

-- Step 4: Migrate existing guides to guide_history (if they exist)
UPDATE chapters
SET guide_history = jsonb_build_array(
    jsonb_build_object(
        'content', guide,
        'created_at', NOW(),
        'version', 0
    )
)
WHERE guide IS NOT NULL AND guide != '' AND guide_history = '[]'::jsonb;

-- Step 5: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chapters_guide_history ON chapters USING GIN (guide_history);
CREATE INDEX IF NOT EXISTS idx_chapters_current_guide_version ON chapters(current_guide_version);

-- Step 6: Add comments to document the columns
COMMENT ON COLUMN chapters.guide IS 'Current AI-generated writing guide (for backward compatibility)';
COMMENT ON COLUMN chapters.guide_history IS 'Array of all guide versions with timestamps';
COMMENT ON COLUMN chapters.current_guide_version IS 'Index of currently displayed guide version (0-based)';
