-- Add "Document Management" top-level menu with "Document Reviews" child
INSERT INTO menu_item (id, menu_id, parent_id, item_key, label, icon, screen_slug, position)
VALUES (
    'b0000000-0000-0000-0000-000000000009',
    'a0000000-0000-0000-0000-000000000001',
    NULL,
    'document-management',
    'Document Management',
    'FileCheck',
    NULL,
    8
);

INSERT INTO menu_item (id, menu_id, parent_id, item_key, label, icon, screen_slug, position)
VALUES (
    'c0000000-0000-0000-0000-000000000060',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000009',
    'document-reviews',
    'Document Reviews',
    'FileCheck',
    '/document-reviews',
    0
);
