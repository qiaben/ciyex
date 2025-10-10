-- Create portal tables in public schema for patient registration and approval workflow

-- Portal Users table - stores all patient registrations
CREATE TABLE IF NOT EXISTS public.portal_users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    org_id BIGINT NOT NULL,
    reason VARCHAR(500),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_date TIMESTAMP,
    approved_by BIGINT,
    rejected_date TIMESTAMP,
    rejected_by BIGINT
);

-- Portal Patients table - stores detailed patient information linked to portal users
CREATE TABLE IF NOT EXISTS public.portal_patients (
    id BIGSERIAL PRIMARY KEY,
    portal_user_id BIGINT NOT NULL REFERENCES public.portal_users(id) ON DELETE CASCADE,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(50) DEFAULT 'USA',
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(100),
    medical_record_number VARCHAR(50),
    ehr_patient_id BIGINT, -- Links to tenant schema patient after approval
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_portal_users_email ON public.portal_users(email);
CREATE INDEX idx_portal_users_status ON public.portal_users(status);
CREATE INDEX idx_portal_users_org_id ON public.portal_users(org_id);
CREATE INDEX idx_portal_patients_portal_user_id ON public.portal_patients(portal_user_id);
CREATE INDEX idx_portal_patients_ehr_patient_id ON public.portal_patients(ehr_patient_id);

-- Add constraints
ALTER TABLE public.portal_users 
ADD CONSTRAINT chk_portal_users_status 
CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'));

-- Update trigger for last_modified_date
CREATE OR REPLACE FUNCTION update_last_modified_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified_date = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_portal_users_last_modified
    BEFORE UPDATE ON public.portal_users
    FOR EACH ROW
    EXECUTE FUNCTION update_last_modified_date();

CREATE TRIGGER trg_portal_patients_last_modified
    BEFORE UPDATE ON public.portal_patients
    FOR EACH ROW
    EXECUTE FUNCTION update_last_modified_date();