-- V191: Properly fix insurance status options and document status required flag
-- Previous V188/V190 migrations used text REPLACE which didn't match JSONB formatting

-- Fix insurance-coverage status options: keep only Active + Inactive
DO $$
DECLARE
    r RECORD;
    cfg jsonb;
    sections jsonb;
    new_sections jsonb := '[]'::jsonb;
BEGIN
    FOR r IN SELECT id, field_config FROM tab_field_config WHERE tab_key = 'insurance-coverage'
    LOOP
        cfg := r.field_config;
        sections := cfg->'sections';
        new_sections := '[]'::jsonb;

        FOR i IN 0..jsonb_array_length(sections)-1
        LOOP
            DECLARE
                section jsonb := sections->i;
                fields jsonb := section->'fields';
                new_fields jsonb := '[]'::jsonb;
            BEGIN
                FOR j IN 0..jsonb_array_length(fields)-1
                LOOP
                    DECLARE
                        field jsonb := fields->j;
                    BEGIN
                        IF field->>'key' = 'status' THEN
                            -- Replace options with only Active and Inactive
                            field := jsonb_set(field, '{options}',
                                '[{"value": "active", "label": "Active"}, {"value": "inactive", "label": "Inactive"}]'::jsonb
                            );
                        END IF;
                        new_fields := new_fields || jsonb_build_array(field);
                    END;
                END LOOP;
                section := jsonb_set(section, '{fields}', new_fields);
                new_sections := new_sections || jsonb_build_array(section);
            END;
        END LOOP;

        UPDATE tab_field_config
        SET field_config = jsonb_set(cfg, '{sections}', new_sections)
        WHERE id = r.id;
    END LOOP;
END $$;

-- Fix documents status field: set required to false
DO $$
DECLARE
    r RECORD;
    cfg jsonb;
    sections jsonb;
    new_sections jsonb := '[]'::jsonb;
BEGIN
    FOR r IN SELECT id, field_config FROM tab_field_config WHERE tab_key IN ('documents', 'document-references')
    LOOP
        cfg := r.field_config;
        sections := cfg->'sections';
        new_sections := '[]'::jsonb;

        FOR i IN 0..jsonb_array_length(sections)-1
        LOOP
            DECLARE
                section jsonb := sections->i;
                fields jsonb := section->'fields';
                new_fields jsonb := '[]'::jsonb;
            BEGIN
                FOR j IN 0..jsonb_array_length(fields)-1
                LOOP
                    DECLARE
                        field jsonb := fields->j;
                    BEGIN
                        IF field->>'key' = 'status' THEN
                            field := jsonb_set(field, '{required}', 'false'::jsonb);
                        END IF;
                        new_fields := new_fields || jsonb_build_array(field);
                    END;
                END LOOP;
                section := jsonb_set(section, '{fields}', new_fields);
                new_sections := new_sections || jsonb_build_array(section);
            END;
        END LOOP;

        UPDATE tab_field_config
        SET field_config = jsonb_set(cfg, '{sections}', new_sections)
        WHERE id = r.id;
    END LOOP;
END $$;
