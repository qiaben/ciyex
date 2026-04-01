-- Add patient name columns to lab_order for search support
ALTER TABLE lab_order ADD COLUMN IF NOT EXISTS patient_first_name VARCHAR(255);
ALTER TABLE lab_order ADD COLUMN IF NOT EXISTS patient_last_name VARCHAR(255);

-- Backfill existing records from patient table
UPDATE lab_order lo
SET patient_first_name = p.first_name,
    patient_last_name = p.last_name
FROM patient p
WHERE lo.patient_id = p.id
  AND lo.patient_first_name IS NULL;
