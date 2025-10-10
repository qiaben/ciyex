-- Fix portal users status for login testing
-- Update existing users to APPROVED status and ensure all sample users exist

-- First, ensure we have the correct users with APPROVED status
INSERT INTO portal_users (first_name, last_name, email, password, phone_number, status, org_id, created_date, last_modified_date) 
VALUES 
('Lina', 'Patel', 'lina.patel@example.com', '$2a$10$K8eJz5f4rJ3XW8U5.rE0dOCK3L.RtL8rO5vT4s2z7YWg6f2B1oTh2', '555-0105', 'APPROVED', 1, NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET 
    status = 'APPROVED',
    last_modified_date = NOW();

-- Update any existing users to APPROVED status (except Mike who should stay PENDING for testing)
UPDATE portal_users 
SET status = 'APPROVED', last_modified_date = NOW() 
WHERE email IN ('john.doe@example.com', 'jane.smith@example.com', 'sarah.williams@example.com', 'lina.patel@example.com');

-- Ensure Mike stays PENDING for testing rejected status scenarios
UPDATE portal_users 
SET status = 'PENDING', last_modified_date = NOW() 
WHERE email = 'mike.johnson@example.com';