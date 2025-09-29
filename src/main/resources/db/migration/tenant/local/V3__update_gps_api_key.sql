-- Update GPS API key in org_config.integrations for the current tenant schema
-- Placeholders ${schema} and ${orgId} are provided by TenantFlywayMigrator.

SET search_path TO ${schema};

-- Replace or set the gps.apiKey value
UPDATE org_config
SET integrations = jsonb_set(
    COALESCE(integrations, '{}'::jsonb),
    '{gps,apiKey}',
    to_jsonb('REPLACE_WITH_GPS_KEY'::text),
    true
)
WHERE org_id = ${orgId};

-- Insert minimal org_config row if none exists
INSERT INTO org_config (integrations, org_id)
SELECT jsonb_build_object('gps', jsonb_build_object('apiKey', to_jsonb('REPLACE_WITH_GPS_KEY'::text))), ${orgId}
WHERE NOT EXISTS (SELECT 1 FROM org_config WHERE org_id = ${orgId});
