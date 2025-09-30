-- Update GPS API key in public.org_config for all organizations
-- This migration moves tenant-specific GPS API key updates into the master schema.
-- It is idempotent: it only sets the key when it is missing/null for a record.

SET search_path TO public;

-- Replace or set the gps.apiKey value only when it is not already present.
UPDATE public.org_config
SET integrations = jsonb_set(
    COALESCE(integrations, '{}'::jsonb),
    '{gps,apiKey}',
    to_jsonb('REPLACE_WITH_GPS_KEY'::text),
    true
)
WHERE (
    integrations IS NULL
    OR (integrations -> 'gps') IS NULL
    OR (integrations -> 'gps' ->> 'apiKey') IS NULL
);

-- Note: After running this migration, replace the placeholder value above
-- with the actual GPS API key via an additional migration or a secure
-- deployment-time secret injection process. This migration intentionally
-- uses a placeholder to avoid committing secrets in source control.
