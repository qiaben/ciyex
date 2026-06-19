-- =============================================
-- V197: Fee Sheet billing — Price Level + Fee Sheet
-- Backs the Settings → Price Level grid, the Fee Sheet editor, and the
-- Operations → Payments "Encounter Billing" dashboard.
-- =============================================

-- ── Price levels (OpenEMR-style fee-sheet price-level options) ──
CREATE TABLE price_level (
    id          BIGSERIAL PRIMARY KEY,
    option_id   VARCHAR(60)  NOT NULL,
    title       VARCHAR(255) NOT NULL,
    seq         INTEGER      DEFAULT 0,
    is_default  BOOLEAN      DEFAULT FALSE,
    active      BOOLEAN      DEFAULT TRUE,
    notes       TEXT,
    codes       TEXT,
    org_alias   VARCHAR(100) NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE INDEX idx_price_level_org ON price_level(org_alias, seq);

-- ── Fee sheets (per-encounter billable charges) ──
CREATE TABLE fee_sheet (
    id                      BIGSERIAL PRIMARY KEY,
    encounter_id            VARCHAR(64),
    patient_id              VARCHAR(64),
    patient_name            VARCHAR(255),
    price_level             VARCHAR(60),
    rendering_provider      VARCHAR(64),
    rendering_provider_name VARCHAR(255),
    supervising_provider    VARCHAR(64),
    total                   NUMERIC(12,2) DEFAULT 0,
    total_paid              NUMERIC(12,2) DEFAULT 0,
    billing_status          VARCHAR(40)   DEFAULT 'Unbilled',
    billed_mode             VARCHAR(40)   DEFAULT 'cash',
    payment_status          VARCHAR(40)   DEFAULT 'None',
    comments                TEXT,
    items                   JSONB         DEFAULT '[]'::jsonb,
    org_alias               VARCHAR(100)  NOT NULL,
    created_at              TIMESTAMP     NOT NULL DEFAULT now(),
    updated_at              TIMESTAMP     NOT NULL DEFAULT now()
);

CREATE INDEX idx_fee_sheet_org ON fee_sheet(org_alias, created_at DESC);
CREATE INDEX idx_fee_sheet_encounter ON fee_sheet(org_alias, encounter_id);
