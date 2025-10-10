-- Insert list options for visit types and priorities
-- This migration adds the required list options that the portal UI expects

INSERT INTO list_options (org_id, list_id, option_id, title, seq, is_default, option_value, notes, codes, activity, edit_options, timestamp, last_updated) VALUES
-- Visit Types
('${orgId}', 'visit_types', 'consultation', 'Consultation', 1, false, null, null, null, 1, true, NOW(), NOW()),
('${orgId}', 'visit_types', 'followup', 'Follow-up', 2, false, null, null, null, 1, true, NOW(), NOW()),
('${orgId}', 'visit_types', 'virtual', 'Virtual Visit', 3, false, null, null, null, 1, true, NOW(), NOW()),
('${orgId}', 'visit_types', 'telehealth', 'Telehealth', 4, false, null, null, null, 1, true, NOW(), NOW()),
('${orgId}', 'visit_types', 'video', 'Video Call', 5, false, null, null, null, 1, true, NOW(), NOW()),
('${orgId}', 'visit_types', 'physical', 'Physical Exam', 6, false, null, null, null, 1, true, NOW(), NOW()),
('${orgId}', 'visit_types', 'urgent', 'Urgent Care', 7, false, null, null, null, 1, true, NOW(), NOW()),

-- Priorities
('${orgId}', 'appointment_priorities', 'routine', 'Routine', 1, true, null, null, null, 1, true, NOW(), NOW()),
('${orgId}', 'appointment_priorities', 'urgent', 'Urgent', 2, false, null, null, null, 1, true, NOW(), NOW()),
('${orgId}', 'appointment_priorities', 'asap', 'ASAP', 3, false, null, null, null, 1, true, NOW(), NOW()),
('${orgId}', 'appointment_priorities', 'emergency', 'Emergency', 4, false, null, null, null, 1, true, NOW(), NOW());