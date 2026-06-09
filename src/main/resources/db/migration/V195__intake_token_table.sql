-- Tokenized, no-login access for patient intake forms sent by SMS/email.
CREATE TABLE IF NOT EXISTS intake_token (
    id              BIGSERIAL PRIMARY KEY,
    token           VARCHAR(255) NOT NULL UNIQUE,
    org_alias       VARCHAR(100) NOT NULL,
    form_id         BIGINT NOT NULL,
    patient_id      VARCHAR(100),
    recipient_name  VARCHAR(255),
    recipient_phone VARCHAR(50),
    recipient_email VARCHAR(255),
    status          VARCHAR(20) NOT NULL DEFAULT 'sent',
    submission_id   BIGINT,
    expires_at      TIMESTAMPTZ NOT NULL,
    used_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_intake_token_token ON intake_token(token);
CREATE INDEX IF NOT EXISTS idx_intake_token_org ON intake_token(org_alias, status);
