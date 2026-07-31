-- V205: Platform-wide default notification preferences for appointment events.
--
-- A per-org notification_preference row is only ever created lazily, when someone
-- opens Settings > Notifications (NotificationConfigService.listPreferences /
-- listTemplates seed defaults on read). Org provisioning never writes one. Because
-- AppointmentNotificationService treated "no row" as "disabled", any practice that
-- had never visited that page sent no appointment confirmation at all — silently:
-- no send attempt, no notification_log entry, no error. That is why appointment
-- emails worked on dev/stage (where the page had been opened long ago) but not in
-- production.
--
-- Mirrors V168, which established the same '__SYSTEM__' default row for
-- secure_message_received.

INSERT INTO notification_preference (org_alias, event_type, email_enabled, sms_enabled, timing)
VALUES
    ('__SYSTEM__', 'appointment_confirmation', true, false, 'immediate'),
    ('__SYSTEM__', 'appointment_reminder',     true, false, '24h_before')
ON CONFLICT (org_alias, event_type) DO NOTHING;

-- Backfill orgs that already have email configured but never had the preference
-- seeded, so their setting is visible/editable in Settings > Notifications rather
-- than only implied by the __SYSTEM__ fallback.
INSERT INTO notification_preference (org_alias, event_type, email_enabled, sms_enabled, timing)
SELECT nc.org_alias, e.event_type, true, false, e.timing
FROM (SELECT DISTINCT org_alias FROM notification_config WHERE org_alias IS NOT NULL) nc
CROSS JOIN (VALUES
    ('appointment_confirmation', 'immediate'),
    ('appointment_reminder', '24h_before')
) AS e(event_type, timing)
ON CONFLICT (org_alias, event_type) DO NOTHING;
