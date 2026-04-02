-- Add patient name columns to lab_order for search support
ALTER TABLE lab_order ADD COLUMN IF NOT EXISTS patient_first_name VARCHAR(255);
ALTER TABLE lab_order ADD COLUMN IF NOT EXISTS patient_last_name VARCHAR(255);
