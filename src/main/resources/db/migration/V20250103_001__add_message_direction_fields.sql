-- Add message direction fields to communications table
ALTER TABLE communications 
ADD COLUMN message_type VARCHAR(50),
ADD COLUMN from_type VARCHAR(20),
ADD COLUMN from_id BIGINT,
ADD COLUMN from_name VARCHAR(255);

-- Update existing records to have proper message direction
-- For existing records, we'll assume patient_to_provider if provider_id is set
UPDATE communications 
SET message_type = 'patient_to_provider',
    from_type = 'patient'
WHERE message_type IS NULL AND provider_id IS NOT NULL;

-- For records without provider_id, assume provider_to_patient
UPDATE communications 
SET message_type = 'provider_to_patient',
    from_type = 'provider'
WHERE message_type IS NULL AND provider_id IS NULL;