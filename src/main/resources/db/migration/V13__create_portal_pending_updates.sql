-- Create portal pending updates table for review workflow
-- This table stores patient data changes that require EHR staff approval

CREATE TABLE public.portal_pending_updates (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.portal_users(id) ON DELETE CASCADE,
    update_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    hint VARCHAR(500),
    priority VARCHAR(20) DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    patient_notes TEXT,
    approver_notes TEXT,
    approved_by VARCHAR(255),
    rejection_reason VARCHAR(500),
    created_date TIMESTAMP DEFAULT NOW() NOT NULL,
    last_modified_date TIMESTAMP DEFAULT NOW() NOT NULL,
    reviewed_date TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_portal_pending_updates_user_id ON public.portal_pending_updates(user_id);
CREATE INDEX idx_portal_pending_updates_status ON public.portal_pending_updates(status);
CREATE INDEX idx_portal_pending_updates_type ON public.portal_pending_updates(update_type);
CREATE INDEX idx_portal_pending_updates_priority ON public.portal_pending_updates(priority);
CREATE INDEX idx_portal_pending_updates_created_date ON public.portal_pending_updates(created_date);

-- Add comments for documentation
COMMENT ON TABLE public.portal_pending_updates IS 'Review queue for patient portal data changes requiring EHR staff approval';
COMMENT ON COLUMN public.portal_pending_updates.update_type IS 'Type of update: DEMOGRAPHICS, INSURANCE, BILLING, MESSAGING, EMERGENCY_CONTACT, APPOINTMENT';
COMMENT ON COLUMN public.portal_pending_updates.payload IS 'JSON payload containing the actual data changes';
COMMENT ON COLUMN public.portal_pending_updates.hint IS 'Description or context for EHR staff review';
COMMENT ON COLUMN public.portal_pending_updates.priority IS 'Priority level: LOW, NORMAL, HIGH, URGENT';
COMMENT ON COLUMN public.portal_pending_updates.status IS 'Review status: PENDING, APPROVED, REJECTED';


