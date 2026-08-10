-- =====================================================
-- Insurance tab: restore the Coverage patientSearchParam.
-- V17/V43 originally set fhir_resources to
-- [{"type":"Coverage","patientSearchParam":"beneficiary"}], but a later
-- migration (adding the Organization payer-directory entry) replaced
-- fhir_resources wholesale and dropped the searchParam -- GET
-- /api/coverages/{patientId} (FhirFacadeController.getCoverageByPatient)
-- searches via this config and silently returned "no coverage found" for
-- every patient even when a Coverage record existed (confirmed via direct
-- fhirId lookup). Re-adds patientSearchParam to the Coverage entry
-- without touching the Organization entry.
-- =====================================================

UPDATE tab_field_config
SET fhir_resources = '[{"type": "Organization", "searchParams": {"type": "ins"}}, {"type": "Coverage", "patientSearchParam": "beneficiary"}]'::jsonb
WHERE tab_key = 'insurance' AND practice_type_code = '*' AND org_id = '*';
