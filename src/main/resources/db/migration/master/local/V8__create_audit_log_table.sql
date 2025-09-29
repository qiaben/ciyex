-- Create audit_log table in public schema for master-level audit logging
-- This migration ensures the audit_log relation exists for application audit inserts
CREATE TABLE IF NOT EXISTS public.audit_log (
    id bigserial PRIMARY KEY,
    event_time timestamp with time zone NOT NULL,
    user_id varchar(100) NOT NULL,
    user_role varchar(50) NOT NULL,
    session_id varchar(255),
    action_type varchar(50) NOT NULL,
    entity_type varchar(100) NOT NULL,
    entity_id varchar(100),
    patient_id bigint,
    description varchar(500) NOT NULL,
    details text,
    ip_address varchar(45),
    user_agent varchar(500),
    endpoint varchar(500),
    http_method varchar(10),
    response_status integer,
    success boolean NOT NULL DEFAULT true,
    error_message varchar(1000),
    risk_level varchar(20) DEFAULT 'LOW',
    compliance_critical boolean NOT NULL DEFAULT false,
    organization_id bigint,
    data_classification varchar(50),
    consent_reference varchar(100)
);

CREATE INDEX IF NOT EXISTS idx_audit_user_id ON public.audit_log (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_event_time ON public.audit_log (event_time);
CREATE INDEX IF NOT EXISTS idx_audit_action_type ON public.audit_log (action_type);
CREATE INDEX IF NOT EXISTS idx_audit_entity_type ON public.audit_log (entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_patient_id ON public.audit_log (patient_id);
CREATE INDEX IF NOT EXISTS idx_audit_ip_address ON public.audit_log (ip_address);
CREATE INDEX IF NOT EXISTS idx_audit_session_id ON public.audit_log (session_id);
