-- V201: Remove the "Other" option from the Provider registration Gender field
-- The provider (Practitioner) settings form's Gender select shipped with four
-- options (Male / Female / Other / Unknown). Per QA the "Other" option should
-- not be offered on the provider form; drop it so only Male / Female / Unknown
-- remain. Patient demographics forms are unaffected (separate tab_field_config
-- rows / field keys).
--
-- Rebuild the sections array, filtering the identification.gender field's
-- options to exclude value = 'other'. Uses jsonb functions (not a text regex)
-- so it is independent of key order / whitespace. Idempotent: the EXISTS guard
-- means re-running after the option is gone is a no-op.

UPDATE tab_field_config t
SET field_config = jsonb_set(
        t.field_config, '{sections}',
        (SELECT jsonb_agg(
            CASE WHEN s ? 'fields' THEN jsonb_set(s, '{fields}', (
                SELECT jsonb_agg(
                    CASE WHEN f->>'key' = 'identification.gender'
                        THEN jsonb_set(f, '{options}', (
                            SELECT jsonb_agg(o)
                            FROM jsonb_array_elements(f->'options') o
                            WHERE o->>'value' <> 'other'))
                        ELSE f END)
                FROM jsonb_array_elements(s->'fields') f))
            ELSE s END)
         FROM jsonb_array_elements(t.field_config->'sections') s)),
    version = version + 1,
    updated_at = now()
WHERE t.tab_key IN ('providers', 'provider')
  AND EXISTS (
      SELECT 1
      FROM jsonb_array_elements(t.field_config->'sections') s,
           jsonb_array_elements(s->'fields') f,
           jsonb_array_elements(f->'options') o
      WHERE f->>'key' = 'identification.gender'
        AND o->>'value' = 'other');
