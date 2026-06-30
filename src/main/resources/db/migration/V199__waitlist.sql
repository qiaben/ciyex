-- =============================================
-- V199: Scheduling waitlist
-- Backs the Schedule sidebar "Waitlist" panel (GET /api/waitlist) and the
-- calendar "Add to Waitlist" quick action (POST /api/waitlist). Org-scoped via
-- org_alias (app-level filter, consistent with fee_sheet / price_level in V197).
-- =============================================

CREATE TABLE waitlist (
    id              BIGSERIAL PRIMARY KEY,
    patient_id      VARCHAR(64),
    patient_name    VARCHAR(255),
    requested_type  VARCHAR(120),
    requested_date  VARCHAR(64),
    priority        INTEGER      DEFAULT 1,
    status          VARCHAR(40)  DEFAULT 'waiting',
    notes           TEXT,
    org_alias       VARCHAR(100) NOT NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE INDEX idx_waitlist_org ON waitlist(org_alias, priority, created_at DESC);
