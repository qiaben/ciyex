-- V189: Fix email notification sender address and ensure dynamic templates
-- Replace any hardcoded personal email addresses with help@ciyex.org
-- Ensure appointment_confirmation template exists for all orgs

-- 1. Replace personal Gmail sender addresses with help@ciyex.org
UPDATE notification_config
SET sender_address = 'help@ciyex.org',
    sender_name = COALESCE(sender_name, 'Ciyex EHR'),
    updated_at = now()
WHERE channel_type = 'email'
  AND (sender_address LIKE '%@gmail.com' OR sender_address LIKE '%@yahoo.com' OR sender_address LIKE '%jyothir%');

-- 2. Also update the SMTP config JSONB to replace from_email if it contains personal addresses
UPDATE notification_config
SET config = jsonb_set(
    config,
    '{from_email}',
    '"help@ciyex.org"'
),
    updated_at = now()
WHERE channel_type = 'email'
  AND config::text LIKE '%@gmail.com%';

-- 3. Insert appointment_confirmation email template for orgs that don't have one
INSERT INTO notification_template (name, template_key, channel_type, subject, body, html_body, is_active, is_default, variables, org_alias)
SELECT
    'Appointment Confirmation',
    'appointment_confirmation',
    'email',
    'Appointment Confirmation for {{patient_name}} | {{appointment_date}}',
    'Dear {{patient_name}},

Your appointment has been confirmed.

Date: {{appointment_date}}
Time: {{appointment_time}}
Provider: {{provider_name}}
Location: {{location_name}}

We look forward to seeing you! If you need to reschedule, please call us at {{practice_phone}}.

Thank you,
{{practice_name}}',
    '<p>Dear {{patient_name}},</p>
<p>Your appointment has been confirmed.</p>
<p><strong>Date:</strong> {{appointment_date}}<br/>
<strong>Time:</strong> {{appointment_time}}<br/>
<strong>Provider:</strong> {{provider_name}}<br/>
<strong>Location:</strong> {{location_name}}</p>
<p>We look forward to seeing you! If you need to reschedule, please call us at {{practice_phone}}.</p>
<p>Thank you,<br/>{{practice_name}}</p>',
    true,
    true,
    '["patient_name", "appointment_date", "appointment_time", "provider_name", "location_name", "practice_phone", "practice_name"]'::jsonb,
    oa.org_alias
FROM (SELECT DISTINCT org_alias FROM notification_config WHERE org_alias IS NOT NULL) oa
WHERE NOT EXISTS (
    SELECT 1 FROM notification_template nt
    WHERE nt.org_alias = oa.org_alias AND nt.template_key = 'appointment_confirmation' AND nt.channel_type = 'email'
);

-- 4. Enable appointment_confirmation preference for orgs that have appointment_reminder but not confirmation
INSERT INTO notification_preference (event_type, email_enabled, sms_enabled, org_alias)
SELECT
    'appointment_confirmation',
    true,
    false,
    np.org_alias
FROM notification_preference np
WHERE np.event_type = 'appointment_reminder'
  AND NOT EXISTS (
    SELECT 1 FROM notification_preference np2
    WHERE np2.org_alias = np.org_alias AND np2.event_type = 'appointment_confirmation'
);
