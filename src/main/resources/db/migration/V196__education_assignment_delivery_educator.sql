-- V196: Persist Delivery Method + Educator on patient education assignments
-- The Education form (patient chart) collects Delivery Method and Educator,
-- but patient_education_assignment had no columns for them, so the values were
-- silently dropped on save and the list columns rendered empty. Add the columns
-- so the assignment round-trips. `educator` holds the provider id the picker
-- selected; `educator_name` holds the chosen display name (sent alongside the id)
-- so the table shows a name without a per-row provider lookup.

ALTER TABLE patient_education_assignment
    ADD COLUMN IF NOT EXISTS delivery_method VARCHAR(50),
    ADD COLUMN IF NOT EXISTS educator        VARCHAR(255),
    ADD COLUMN IF NOT EXISTS educator_name   VARCHAR(255);
