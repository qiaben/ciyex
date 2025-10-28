-- Portal Sample Data SQL Script
-- This script adds sample users and patients to test the portal login functionality

-- First, let's work with the public schema for portal_users
SET search_path TO public;

-- Insert sample portal users with APPROVED status for login testing
-- Note: Password is 'password123' encoded with BCrypt
INSERT INTO portal_users (id, first_name, last_name, email, password, phone_number, status, created_at, updated_at) VALUES
(1, 'John', 'Doe', 'john.doe@example.com', '$2a$10$K8eJz5f4rJ3XW8U5.rE0dOCK3L.RtL8rO5vT4s2z7YWg6f2B1oTh2', '555-0101', 'APPROVED', NOW(), NOW()),
(2, 'Jane', 'Smith', 'jane.smith@example.com', '$2a$10$K8eJz5f4rJ3XW8U5.rE0dOCK3L.RtL8rO5vT4s2z7YWg6f2B1oTh2', '555-0102', 'APPROVED', NOW(), NOW()),
(3, 'Mike', 'Johnson', 'mike.johnson@example.com', '$2a$10$K8eJz5f4rJ3XW8U5.rE0dOCK3L.RtL8rO5vT4s2z7YWg6f2B1oTh2', '555-0103', 'PENDING', NOW(), NOW()),
(4, 'Sarah', 'Williams', 'sarah.williams@example.com', '$2a$10$K8eJz5f4rJ3XW8U5.rE0dOCK3L.RtL8rO5vT4s2z7YWg6f2B1oTh2', '555-0104', 'APPROVED', NOW(), NOW());

-- Now add portal patients to each tenant schema
-- Practice 1 Schema
SET search_path TO "practice_1";

INSERT INTO portal_patients (id, portal_user_id, patient_id, org_id, created_at, updated_at) VALUES
(1, 1, 1001, 1, NOW(), NOW()),
(2, 2, 1002, 1, NOW(), NOW()),
(3, 4, 1003, 1, NOW(), NOW());

-- Practice 2 Schema  
SET search_path TO "practice_2";

INSERT INTO portal_patients (id, portal_user_id, patient_id, org_id, created_at, updated_at) VALUES
(1, 1, 2001, 2, NOW(), NOW()),
(2, 2, 2002, 2, NOW(), NOW());

-- Practice 3 Schema
SET search_path TO "practice_3";

INSERT INTO portal_patients (id, portal_user_id, patient_id, org_id, created_at, updated_at) VALUES
(1, 1, 3001, 3, NOW(), NOW()),
(2, 2, 3002, 3, NOW(), NOW()),
(3, 4, 3003, 3, NOW(), NOW());

-- Reset to public schema
SET search_path TO public;

-- Display the inserted data for verification
SELECT 'Portal Users:' as section;
SELECT id, first_name, last_name, email, phone_number, status, created_at FROM portal_users ORDER BY id;

SELECT 'Practice 1 Portal Patients:' as section;
SET search_path TO "practice_1";
SELECT id, portal_user_id, patient_id, org_id, created_at FROM portal_patients ORDER BY id;

SELECT 'Practice 2 Portal Patients:' as section;
SET search_path TO "practice_2";
SELECT id, portal_user_id, patient_id, org_id, created_at FROM portal_patients ORDER BY id;

SELECT 'Practice 3 Portal Patients:' as section;
SET search_path TO "practice_3";
SELECT id, portal_user_id, patient_id, org_id, created_at FROM portal_patients ORDER BY id;

-- Reset to public schema
SET search_path TO public;

-- Show available test credentials
SELECT 'TEST LOGIN CREDENTIALS:' as info;
SELECT 
    'Email: ' || email || ' | Password: password123 | Status: ' || status as login_info
FROM portal_users 
WHERE status = 'APPROVED'
ORDER BY id;