-- Remove Document Reviews menu item from sidebar (if it was added by V180)
DELETE FROM menu_item WHERE item_key = 'document-reviews';
