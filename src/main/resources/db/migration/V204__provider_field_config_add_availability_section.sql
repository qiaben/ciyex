-- V204: Fix the Provider registration form's field config — its sections
-- array shipped with a stray JSON null as the 7th element (meant to be the
-- Availability & Scheduling section, per the settingsHubEditor.ts UI code
-- which already renders an inline Schedule Blocks list + "Manage
-- Availability" action for any provider section keyed/titled "avail" or
-- "schedule", GET/PUT /api/providers/{id}/availability). Iterating that
-- null with `section.label` throws a TypeError that aborts the whole form
-- render — so the Provider add/edit form was left with no fields rendered
-- past System Access AND no Save/Create/Cancel action bar (the action bar
-- is rendered after the sections loop, so the loop never reaches it).
--
-- Replace the null element with a real "availability" section (two boolean
-- checkbox fields — settingsHubEditor.ts only special-cases field.type
-- 'boolean'/'checkbox'/'switch' as a real checkbox; 'toggle' is not a
-- recognized type there and falls back to a plain text input) so the
-- section renders and the surrounding Schedule Blocks UI activates.
-- Idempotent: the EXISTS guard only matches while a null element remains.

UPDATE tab_field_config t
SET field_config = jsonb_set(
        t.field_config, '{sections}',
        (SELECT jsonb_agg(
            CASE WHEN s = 'null'::jsonb THEN '{
                "key": "availability",
                "title": "Availability & Scheduling",
                "fields": [
                    {
                        "key": "scheduling.onCallStatus",
                        "type": "boolean",
                        "label": "Currently On-Call",
                        "colSpan": 1,
                        "required": false,
                        "defaultValue": false
                    },
                    {
                        "key": "scheduling.acceptingNewPatients",
                        "type": "boolean",
                        "label": "Accepting New Patients",
                        "colSpan": 1,
                        "required": false,
                        "defaultValue": true
                    }
                ],
                "columns": 2,
                "collapsed": false,
                "collapsible": true
            }'::jsonb
            ELSE s END)
         FROM jsonb_array_elements(t.field_config->'sections') s)),
    version = version + 1,
    updated_at = now()
WHERE t.tab_key IN ('providers', 'provider')
  AND EXISTS (
      SELECT 1
      FROM jsonb_array_elements(t.field_config->'sections') s
      WHERE s = 'null'::jsonb);
