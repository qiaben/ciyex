-- Add session timeout configuration to practice table
ALTER TABLE practice ADD COLUMN IF NOT EXISTS session_timeout_minutes INTEGER DEFAULT 5;

-- Update existing practices to have default session timeout
UPDATE practice SET session_timeout_minutes = 5 WHERE session_timeout_minutes IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN practice.session_timeout_minutes IS 'Session timeout in minutes for users in this practice (5-30 minutes allowed)';