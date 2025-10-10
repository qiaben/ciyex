-- Insert sample portal patients for practice_3 tenant
-- This migration adds portal patients linked to the sample users

INSERT INTO portal_patients (portal_user_id, patient_id, org_id, created_at, updated_at) VALUES
(1, 3001, 3, NOW(), NOW()),
(2, 3002, 3, NOW(), NOW()),
(4, 3003, 3, NOW(), NOW());