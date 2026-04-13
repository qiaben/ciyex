-- V188: Simplify insurance status dropdown to Active / Inactive only
-- Remove Cancelled, Draft, Entered in Error per production feedback

UPDATE tab_field_config
SET field_config = REPLACE(
    REPLACE(
        REPLACE(
            field_config::text,
            ',{"value":"cancelled","label":"Cancelled"}',
            ''
        ),
        ',{"value":"draft","label":"Draft"}',
        ''
    ),
    ',{"value":"entered-in-error","label":"Entered in Error"}',
    ''
)::jsonb
WHERE tab_key = 'insurance-coverage'
  AND field_config::text LIKE '%"cancelled"%';

-- Also add Inactive option if not already present
UPDATE tab_field_config
SET field_config = REPLACE(
    field_config::text,
    '"options":[{"value":"active","label":"Active"}]',
    '"options":[{"value":"active","label":"Active"},{"value":"inactive","label":"Inactive"}]'
)::jsonb
WHERE tab_key = 'insurance-coverage'
  AND field_config::text NOT LIKE '%"inactive"%';
