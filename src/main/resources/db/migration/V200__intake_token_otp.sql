-- OTP verification for patient intake links: before the form opens, the patient
-- must enter a one-time code sent to the same channel (SMS/email) the link was
-- sent to. Prevents a forwarded link from being filled by anyone.
ALTER TABLE intake_token ADD COLUMN IF NOT EXISTS channel VARCHAR(20);
ALTER TABLE intake_token ADD COLUMN IF NOT EXISTS otp_code VARCHAR(20);
ALTER TABLE intake_token ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP;
ALTER TABLE intake_token ADD COLUMN IF NOT EXISTS otp_sent_at TIMESTAMP;
ALTER TABLE intake_token ADD COLUMN IF NOT EXISTS otp_attempts INTEGER DEFAULT 0;
ALTER TABLE intake_token ADD COLUMN IF NOT EXISTS otp_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE intake_token ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);
