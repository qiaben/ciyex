-- Migration to drop org_config table from tenant schemas
-- This runs AFTER the master migration has moved the data to master schema
-- The org_config table is now managed in the master schema only

-- Drop org_config table if it exists in this tenant schema
DROP TABLE IF EXISTS org_config CASCADE;

-- Log the operation
DO $$
BEGIN
    RAISE NOTICE 'Dropped org_config table from tenant schema (if it existed)';
    RAISE NOTICE 'org_config data is now managed in the master schema (public.org_config)';
END;
$$;