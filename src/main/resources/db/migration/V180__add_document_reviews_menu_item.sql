-- Add "Document Reviews" menu item under Patients in the EHR sidebar
INSERT INTO menu_item (menu_id, parent_id, item_key, label, icon, screen_slug, position, created_at, updated_at)
VALUES (
    'a0000000-0000-0000-0000-000000000001',  -- ehr-sidebar menu
    'b0000000-0000-0000-0000-000000000003',  -- parent: Patients
    'document-reviews',
    'Document Reviews',
    'FileCheck',
    '/document-reviews',
    6,
    NOW(), NOW()
);
