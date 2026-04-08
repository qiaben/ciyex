-- Extension licensing tables for Ciyex Workspace marketplace
-- Replaces ciyex-marketplace subscription management with lightweight licensing

-- 1. Extension licenses (who paid for what)
CREATE TABLE IF NOT EXISTS extension_licenses (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_alias           VARCHAR(100) NOT NULL,
    extension_id        VARCHAR(200) NOT NULL,
    plan_id             VARCHAR(50),
    status              VARCHAR(20) NOT NULL DEFAULT 'active',
    stripe_sub_id       VARCHAR(100),
    stripe_customer_id  VARCHAR(100),
    trial_ends_at       TIMESTAMPTZ,
    current_period_end  TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_license_org_ext UNIQUE (org_alias, extension_id)
);

CREATE INDEX idx_ext_license_org ON extension_licenses(org_alias);
CREATE INDEX idx_ext_license_status ON extension_licenses(status);
CREATE INDEX idx_ext_license_stripe ON extension_licenses(stripe_sub_id);

-- 2. Extension usage metering (for usage-based pricing)
CREATE TABLE IF NOT EXISTS extension_usage (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_alias       VARCHAR(100) NOT NULL,
    extension_id    VARCHAR(200) NOT NULL,
    event_type      VARCHAR(50) NOT NULL,
    count           INTEGER NOT NULL DEFAULT 1,
    recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ext_usage_org_ext ON extension_usage(org_alias, extension_id, recorded_at);

-- 3. Extension vendors (Stripe Connect payouts)
CREATE TABLE IF NOT EXISTS extension_vendors (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publisher_name  VARCHAR(100) NOT NULL UNIQUE,
    stripe_account  VARCHAR(100),
    payout_percent  INTEGER NOT NULL DEFAULT 80,
    contact_email   VARCHAR(200),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
