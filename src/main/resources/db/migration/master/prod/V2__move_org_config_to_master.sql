-- Migration to move org_config table from tenant schemas to master schema
-- This migration:
-- 1. Creates org_config table in master schema if not exists
-- 2. Migrates data from all tenant schemas to master schema
-- 3. Handles JSONB column type properly

-- Ensure we're in the master schema
SET search_path TO public;

-- Create org_config table in master schema if not exists
CREATE TABLE IF NOT EXISTS org_config (
    id BIGSERIAL PRIMARY KEY,
    org_id BIGINT NOT NULL UNIQUE,
    integrations JSONB
);

-- Create index on org_id for performance
CREATE INDEX IF NOT EXISTS idx_org_config_org_id ON org_config(org_id);

-- Function to migrate org_config data from tenant schemas to master schema
CREATE OR REPLACE FUNCTION migrate_org_config_to_master()
RETURNS INTEGER AS $$
DECLARE
    tenant_schema TEXT;
    org_id_val BIGINT;
    migrated_count INTEGER := 0;
    tenant_record RECORD;
    schema_cursor CURSOR FOR 
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name LIKE 'practice_%';
BEGIN
    -- Loop through all tenant schemas
    FOR tenant_schema IN schema_cursor LOOP
        BEGIN
            -- Extract org_id from schema name (practice_123 -> 123)
            org_id_val := CAST(SUBSTRING(tenant_schema FROM 'practice_(.*)') AS BIGINT);
            
            -- Check if org_config table exists in this tenant schema
            IF EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_schema = tenant_schema 
                AND table_name = 'org_config'
            ) THEN
                -- Check if we already have data for this org_id in master schema
                IF NOT EXISTS (SELECT 1 FROM public.org_config WHERE org_id = org_id_val) THEN
                    -- Migrate data from tenant schema to master schema
                    EXECUTE format('
                        INSERT INTO public.org_config (org_id, integrations)
                        SELECT org_id, integrations 
                        FROM %I.org_config 
                        WHERE org_id = $1
                        ON CONFLICT (org_id) DO NOTHING
                    ', tenant_schema) USING org_id_val;
                    
                    -- Count migrated records
                    GET DIAGNOSTICS migrated_count = ROW_COUNT;
                    
                    IF migrated_count > 0 THEN
                        RAISE NOTICE 'Migrated % org_config record(s) from schema % for org_id %', 
                            migrated_count, tenant_schema, org_id_val;
                    END IF;
                ELSE
                    RAISE NOTICE 'Skipping migration from % - org_id % already exists in master schema', 
                        tenant_schema, org_id_val;
                END IF;
            ELSE
                RAISE NOTICE 'No org_config table found in schema %', tenant_schema;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Failed to migrate from schema %: %', tenant_schema, SQLERRM;
            CONTINUE;
        END;
    END LOOP;
    
    RETURN migrated_count;
END;
$$ LANGUAGE plpgsql;

-- Execute the migration
DO $$
DECLARE
    total_migrated INTEGER;
BEGIN
    RAISE NOTICE 'Starting migration of org_config from tenant schemas to master schema...';
    
    SELECT migrate_org_config_to_master() INTO total_migrated;
    
    RAISE NOTICE 'Migration completed. Total records processed: %', COALESCE(total_migrated, 0);
    
    -- Verify the migration
    RAISE NOTICE 'Master schema now contains % org_config records', 
        (SELECT COUNT(*) FROM public.org_config);
END;
$$;

-- Clean up the migration function
DROP FUNCTION IF EXISTS migrate_org_config_to_master();

-- Ensure integrations column is JSONB type
DO $$
BEGIN
    -- Check if integrations column exists and is not already JSONB
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'org_config' 
        AND column_name = 'integrations'
        AND data_type != 'jsonb'
    ) THEN
        -- Convert to JSONB if needed
        ALTER TABLE public.org_config 
        ALTER COLUMN integrations TYPE JSONB USING integrations::JSONB;
        
        RAISE NOTICE 'Converted integrations column to JSONB type';
    END IF;
END;
$$;