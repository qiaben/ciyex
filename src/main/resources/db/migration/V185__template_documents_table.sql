CREATE TABLE template_document (
    id          BIGSERIAL PRIMARY KEY,
    org_alias   VARCHAR(100) NOT NULL,
    name        VARCHAR(255) NOT NULL,
    context     VARCHAR(20)  NOT NULL DEFAULT 'ENCOUNTER',
    content     TEXT         NOT NULL DEFAULT '',
    options     JSONB        NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_template_doc_org_ctx ON template_document(org_alias, context);
