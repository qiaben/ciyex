-- Rename "Document Management" to "Portal Management" in sidebar
UPDATE menu_item
SET label = 'Portal Management', item_key = 'portal-management', icon = 'ShieldCheck'
WHERE id = 'b0000000-0000-0000-0000-000000000009';
