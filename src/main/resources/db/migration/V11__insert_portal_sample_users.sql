-- Portal Sample Data Migration
-- This migration adds sample users and patients for testing the portal functionality

-- Insert sample portal users with APPROVED status for login testing
-- Note: Password is 'password123' encoded with BCrypt ($2a$10$K8eJz5f4rJ3XW8U5.rE0dOCK3L.RtL8rO5vT4s2z7YWg6f2B1oTh2)
INSERT INTO portal_users (first_name, last_name, email, password, phone_number, status, created_date, last_modified_date) VALUES
('John', 'Doe', 'john.doe@example.com', '$2a$10$K8eJz5f4rJ3XW8U5.rE0dOCK3L.RtL8rO5vT4s2z7YWg6f2B1oTh2', '555-0101', 'APPROVED', NOW(), NOW()),
('Jane', 'Smith', 'jane.smith@example.com', '$2a$10$K8eJz5f4rJ3XW8U5.rE0dOCK3L.RtL8rO5vT4s2z7YWg6f2B1oTh2', '555-0102', 'APPROVED', NOW(), NOW()),
('Mike', 'Johnson', 'mike.johnson@example.com', '$2a$10$K8eJz5f4rJ3XW8U5.rE0dOCK3L.RtL8rO5vT4s2z7YWg6f2B1oTh2', '555-0103', 'PENDING', NOW(), NOW()),
('Sarah', 'Williams', 'sarah.williams@example.com', '$2a$10$K8eJz5f4rJ3XW8U5.rE0dOCK3L.RtL8rO5vT4s2z7YWg6f2B1oTh2', '555-0104', 'APPROVED', NOW(), NOW()),
('Lina', 'Patel', 'lina.patel@example.com', '$2a$10$K8eJz5f4rJ3XW8U5.rE0dOCK3L.RtL8rO5vT4s2z7YWg6f2B1oTh2', '555-0105', 'APPROVED', NOW(), NOW());