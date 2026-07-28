-- =============================================
-- V194: Seed default education materials
-- =============================================
-- Without seed data, /api/education/materials returns an empty list, the
-- patient-chart "Assign Education" form has no rows to pick from, the user
-- can't choose a material, and the save fails with the cryptic
-- "The given id must not be null". Seeding a default catalog per dev/seed
-- org gives users something to assign on day one.
--
-- Idempotent: the NOT EXISTS guard means it is safe to re-run.
--
-- The org list used to come straight from `SELECT DISTINCT org_alias FROM
-- patient`, but no migration ever creates a `patient` table — patients live in
-- FHIR, and only legacy databases still carry one. Everywhere else (production
-- included) this migration aborted with `relation "patient" does not exist` and
-- failed the whole chain, so deployments pinned SPRING_FLYWAY_TARGET=current to
-- keep the pods up. That pin froze the schema at V193 and silently withheld
-- every later migration — V197's `fee_sheet` / `price_level` among them, which
-- is why signing an encounter could not create its fee sheet. Resolve the org
-- list at runtime instead: use `patient` where it exists, otherwise the
-- org-scoped tables that are guaranteed to be present by this point.

DO $seed$
DECLARE
    org_source text;
BEGIN
    IF to_regclass('public.patient') IS NOT NULL THEN
        org_source := 'SELECT org_alias FROM patient WHERE org_alias IS NOT NULL';
    ELSE
        org_source := '
                  SELECT org_alias FROM patient_consent          WHERE org_alias IS NOT NULL
            UNION SELECT org_alias FROM fhir_resource_form_data  WHERE org_alias IS NOT NULL
            UNION SELECT org_alias FROM patient_ledger           WHERE org_alias IS NOT NULL
            UNION SELECT org_alias FROM audit_log                WHERE org_alias IS NOT NULL
            UNION SELECT org_alias FROM education_material       WHERE org_alias IS NOT NULL';
    END IF;

    EXECUTE format($insert$
        INSERT INTO education_material (title, category, content_type, content, language, audience, source, is_active, org_alias)
        SELECT title, category, content_type, content, 'en', 'patient', source, true, org_alias FROM (
            VALUES
                ('Understanding Type 2 Diabetes', 'diabetes', 'article',
                 'Type 2 diabetes is a long-term condition where blood sugar levels are too high. Lifestyle changes, medication, and regular check-ups can help manage it.',
                 'ADA'),
                ('Managing High Blood Pressure', 'hypertension', 'article',
                 'Hypertension increases the risk of heart disease and stroke. Reduce salt intake, exercise regularly, and take prescribed medication.',
                 'AHA'),
                ('Healthy Eating Basics', 'nutrition', 'article',
                 'A balanced diet emphasises vegetables, whole grains, lean protein, and limits added sugars and saturated fat.',
                 'CDC'),
                ('Asthma Action Plan', 'preventive', 'handout',
                 'Identify your triggers, follow your inhaler schedule, and recognise the warning signs that mean you should call your provider.',
                 'NIH'),
                ('Post-Surgical Care Instructions', 'post_surgical', 'handout',
                 'Keep the incision clean and dry, take medications as prescribed, watch for signs of infection (fever, redness, drainage).',
                 'Mayo Clinic'),
                ('Pregnancy Wellness Guide', 'prenatal', 'article',
                 'Attend all prenatal visits, take your prenatal vitamins, avoid alcohol/tobacco, and call your provider for any unusual symptoms.',
                 'ACOG'),
                ('Pediatric Vaccination Schedule', 'pediatric', 'pdf',
                 'See the CDC recommended immunisation schedule for children from birth through age 18.',
                 'CDC'),
                ('Stress and Mental Health', 'mental_health', 'article',
                 'Stress is normal; chronic stress is not. Try journaling, exercise, and reach out to a mental-health professional when needed.',
                 'NIMH'),
                ('Heart-Healthy Exercise', 'exercise', 'article',
                 'Aim for 150 minutes of moderate aerobic activity per week. Start slow, listen to your body, and check with your provider before starting a new programme.',
                 'AHA'),
                ('Medication Adherence Tips', 'medication', 'handout',
                 'Use a weekly pill organiser, set phone reminders, and never stop a prescription without speaking to your provider.',
                 'FDA')
        ) AS material(title, category, content_type, content, source)
        CROSS JOIN (SELECT DISTINCT org_alias FROM (%s) AS o) AS orgs
        WHERE NOT EXISTS (
            SELECT 1 FROM education_material em
            WHERE em.org_alias = orgs.org_alias AND em.title = material.title
        )
    $insert$, org_source);
END
$seed$;
