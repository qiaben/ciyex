-- Add "Form Reviews" and "Patient Approvals" under Portal Management menu
INSERT INTO menu_item (id, menu_id, parent_id, item_key, label, icon, screen_slug, position)
VALUES (
    'c0000000-0000-0000-0000-000000000061',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000009',
    'form-reviews',
    'Form Reviews',
    'ClipboardList',
    '/form-submissions',
    1
) ON CONFLICT (id) DO NOTHING;

INSERT INTO menu_item (id, menu_id, parent_id, item_key, label, icon, screen_slug, position)
VALUES (
    'c0000000-0000-0000-0000-000000000062',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000009',
    'patient-approvals',
    'Patient Approvals',
    'UserCheck',
    '/patient-approvals',
    2
) ON CONFLICT (id) DO NOTHING;

-- Reorder: Document Reviews at position 0 (already), Form Reviews at 1, Patient Approvals at 2
UPDATE menu_item SET position = 0 WHERE id = 'c0000000-0000-0000-0000-000000000060';
