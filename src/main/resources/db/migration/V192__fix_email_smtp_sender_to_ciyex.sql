-- V192: Ensure sender_address is help@ciyex.org for all email configs
-- Note: SMTP username (auth) stays unchanged — only the visible "From" address changes.
-- If using Gmail, configure help@ciyex.org as a "Send as" alias in Gmail settings.

-- 1. Update sender_address for all email configs that still use old addresses
UPDATE notification_config
SET sender_address = 'help@ciyex.org',
    sender_name = COALESCE(
        NULLIF(sender_name, ''),
        'Ciyex EHR'
    ),
    updated_at = now()
WHERE channel_type = 'email'
  AND (sender_address IS NULL OR sender_address != 'help@ciyex.org');

-- 2. Update from_email in config JSON
UPDATE notification_config
SET config = jsonb_set(config, '{from_email}', '"help@ciyex.org"'),
    updated_at = now()
WHERE channel_type = 'email'
  AND config IS NOT NULL
  AND (config->>'from_email' IS NULL OR config->>'from_email' != 'help@ciyex.org');
