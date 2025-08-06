-- Migration: Add Google OAuth fields to users table
-- Date: 2024-01-XX

-- Add google_id column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Add comment for documentation
COMMENT ON COLUMN users.google_id IS 'Google OAuth ID for authentication';

-- Update existing users to have NULL google_id
UPDATE users SET google_id = NULL WHERE google_id IS NULL; 