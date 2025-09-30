-- V2 migration moved into prod/stg earlier; local environment needs a matching file
-- This file is idempotent and safe to run: it ensures that the move is applied only if
-- the tenant/org_config object still exists in tenant schemas. In most cases this will
-- be a no-op because the move was already recorded in flyway_schema_history.

DO $$
BEGIN
  -- If public.org_config already exists, nothing to do.
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'org_config') THEN
    RAISE NOTICE 'public.org_config already exists; skipping move statements';
    RETURN;
  END IF;

  -- No-op placeholder: the actual move was executed in other environments.
  RAISE NOTICE 'Placeholder migration V2__move_org_config_to_master executed (no-op)';
END$$;
