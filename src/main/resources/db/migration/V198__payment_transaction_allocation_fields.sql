-- Add the Post/Edit Payment form's allocation & adjustment fields to
-- payment_transaction. Previously these had no columns, so the form's
-- "Allocation & Adjustments" section (plus payer / claim / date of service)
-- was dropped on save and came back blank when re-opening the Edit Payment form.
ALTER TABLE payment_transaction
    ADD COLUMN IF NOT EXISTS date_of_service          DATE,
    ADD COLUMN IF NOT EXISTS payer_name               VARCHAR(255),
    ADD COLUMN IF NOT EXISTS claim_id                 VARCHAR(100),
    ADD COLUMN IF NOT EXISTS allowed_amount           DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS paid_amount              DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS adjustment_amount        DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS adjustment_reason        VARCHAR(100),
    ADD COLUMN IF NOT EXISTS patient_responsibility   DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS remaining_balance        DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS era_reference            VARCHAR(255);
