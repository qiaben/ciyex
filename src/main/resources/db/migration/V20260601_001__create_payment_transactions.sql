CREATE TABLE IF NOT EXISTS payment_transactions (
    id                  BIGSERIAL PRIMARY KEY,
    patient_id          VARCHAR(64),
    patient_name        VARCHAR(255),
    amount              NUMERIC(12, 2) NOT NULL DEFAULT 0,
    transaction_type    VARCHAR(50)  NOT NULL DEFAULT 'payment',
    payment_method_type VARCHAR(50)  NOT NULL DEFAULT 'cash',
    description         VARCHAR(500),
    invoice_id          VARCHAR(64),
    transaction_id      VARCHAR(255),
    status              VARCHAR(50)  NOT NULL DEFAULT 'completed',
    org_alias           VARCHAR(100),
    collected_at        TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_patient  ON payment_transactions(patient_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_org      ON payment_transactions(org_alias);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status   ON payment_transactions(status);
