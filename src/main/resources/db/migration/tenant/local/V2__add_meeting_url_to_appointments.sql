-- Add meeting_url column to appointments table for Jitsi integration
ALTER TABLE appointments ADD COLUMN meeting_url VARCHAR(500);