-- Add "Document Reviews" menu item under Patients in the EHR sidebar (safe: only if parent exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM menu_item WHERE id = 'b0000000-0000-0000-0000-000000000003') THEN
    INSERT INTO menu_item (menu_id, parent_id, item_key, label, icon, screen_slug, position, created_at, updated_at)
    VALUES (
        'a0000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000003',
        'document-reviews',
        'Document Reviews',
        'FileCheck',
        '/document-reviews',
        6,
        NOW(), NOW()
    )
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
