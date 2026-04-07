CREATE TABLE portal_form_submission (
    id              BIGSERIAL PRIMARY KEY,
    org_alias       VARCHAR(100) NOT NULL,
    patient_id      VARCHAR(100) NOT NULL,
    patient_name    VARCHAR(255),
    form_id         BIGINT NOT NULL REFERENCES portal_form(id),
    form_key        VARCHAR(100) NOT NULL,
    form_title      VARCHAR(255) NOT NULL,
    form_description TEXT,
    response_data   JSONB NOT NULL DEFAULT '{}',
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
    submitted_date  TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_date   TIMESTAMPTZ,
    reviewed_by     VARCHAR(255),
    review_note     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_form_sub_org_status ON portal_form_submission(org_alias, status);
CREATE INDEX idx_form_sub_patient ON portal_form_submission(org_alias, patient_id);
