-- ╔══════════════════════════════════════════════════════════════╗
-- ║  V178: Auto-install telehealth for all existing orgs       ║
-- ╚══════════════════════════════════════════════════════════════╝
--
-- V129 only installed ciyex-telehealth for sunrise-family-medicine and hinisoft.
-- New organizations created after V129 don't have telehealth installed,
-- causing the telehealth plugin to not load in the EHR UI (no nav item,
-- no video call button in patient chart action bar).

INSERT INTO app_installations (id, org_id, app_id, app_slug, app_name, app_category,
                               status, config, extension_points, installed_by, installed_at, updated_at)
SELECT
    gen_random_uuid(),
    orgs.org_id,
    '10000000-0000-0000-0000-000000000006'::uuid,
    'ciyex-telehealth',
    'Ciyex Telehealth',
    'TELEHEALTH',
    'active',
    '{"vendor_name":"Ciyex Telehealth","vendor_id":"mediasoup","default_duration":15,"require_waiting_room":true,"e2e_encryption":true,"hipaa_baa_signed":true}'::jsonb,
    '["settings:nav-item","patient-chart:action-bar"]'::jsonb,
    'system-seed',
    now(),
    now()
FROM (
    -- All known orgs from various tables
    SELECT DISTINCT org_id FROM menu_org_override WHERE org_id IS NOT NULL
    UNION
    SELECT DISTINCT org_alias AS org_id FROM clinical_task WHERE org_alias IS NOT NULL
    UNION
    SELECT DISTINCT org_id FROM app_installations WHERE org_id IS NOT NULL
    UNION
    -- Common dev orgs
    SELECT 'ehr-sunflow'
    UNION
    SELECT 'hinisoft'
    UNION
    SELECT 'hinisoft-dev'
    UNION
    SELECT 'sunrise-family-medicine'
    UNION
    SELECT 'test-clinic-1772851243'
) orgs
WHERE NOT EXISTS (
    SELECT 1 FROM app_installations ai
    WHERE ai.org_id = orgs.org_id AND ai.app_slug = 'ciyex-telehealth'
);
