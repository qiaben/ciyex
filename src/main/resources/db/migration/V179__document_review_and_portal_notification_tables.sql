-- Document review tracking table (patient uploads awaiting staff review)
CREATE TABLE IF NOT EXISTS document_review (
    id              BIGSERIAL PRIMARY KEY,
    fhir_id         VARCHAR(255)  NOT NULL,
    patient_id      BIGINT        NOT NULL,
    patient_name    VARCHAR(255),
    patient_email   VARCHAR(255),
    file_name       VARCHAR(500),
    category        VARCHAR(100),
    description     TEXT,
    content_type    VARCHAR(100),
    file_size       BIGINT,
    status          VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT,
    reviewer_email  VARCHAR(255),
    org_alias       VARCHAR(100)  NOT NULL,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    reviewed_at     TIMESTAMP
);

CREATE INDEX idx_doc_review_org_status ON document_review (org_alias, status);
CREATE INDEX idx_doc_review_patient    ON document_review (patient_email, org_alias);

-- Portal notification table (patient-facing notifications)
CREATE TABLE IF NOT EXISTS portal_notification (
    id              BIGSERIAL PRIMARY KEY,
    patient_id      BIGINT        NOT NULL,
    patient_email   VARCHAR(255),
    type            VARCHAR(50)   NOT NULL,
    title           VARCHAR(255),
    message         TEXT,
    reason          TEXT,
    org_alias       VARCHAR(100)  NOT NULL,
    read_at         TIMESTAMP,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_portal_notif_patient ON portal_notification (patient_email, org_alias);
