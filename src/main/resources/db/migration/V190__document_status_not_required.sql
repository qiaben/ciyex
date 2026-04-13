-- V190: Make document status field optional (not mandatory)
-- Per production feedback: status field should not be required when creating documents

UPDATE tab_field_config
SET field_config = REPLACE(
    field_config::text,
    '"key":"status","label":"Status","type":"select","required":true',
    '"key":"status","label":"Status","type":"select","required":false'
)::jsonb
WHERE tab_key IN ('documents', 'document-references')
  AND field_config::text LIKE '%"key":"status"%';
