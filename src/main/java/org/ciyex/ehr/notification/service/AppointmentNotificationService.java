package org.ciyex.ehr.notification.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ciyex.ehr.notification.entity.NotificationPreference;
import org.ciyex.ehr.notification.repository.NotificationPreferenceRepository;
import org.ciyex.ehr.notification.repository.NotificationTemplateRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * Handles sending notifications triggered by appointment events.
 * Called from FhirFacadeController after appointment creation/update.
 * NOTE: Patient email must be resolved BEFORE calling @Async methods
 * (pass patientEmail in appointmentData) since FHIR/security context
 * is not available in async threads.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentNotificationService {

    /** Org alias holding the platform-wide default notification preferences. */
    private static final String SYSTEM_ORG_ALIAS = "__SYSTEM__";

    private final NotificationService notificationService;
    private final NotificationPreferenceRepository prefRepo;
    private final NotificationTemplateRepository templateRepo;

    /**
     * Fire notification after an appointment is created (booked).
     * Checks event preferences and sends email if appointment_confirmation is enabled.
     */
    @Async
    public void onAppointmentCreated(String orgAlias, Map<String, Object> appointmentData) {
        try {
            sendEventNotification(orgAlias, "appointment_confirmation", appointmentData);
        } catch (Exception e) {
            log.error("Failed to send appointment confirmation notification for org {}: {}",
                    orgAlias, e.getMessage(), e);
        }
    }

    /**
     * Fire notification for appointment reminder.
     */
    @Async
    public void onAppointmentReminder(String orgAlias, Map<String, Object> appointmentData) {
        try {
            sendEventNotification(orgAlias, "appointment_reminder", appointmentData);
        } catch (Exception e) {
            log.error("Failed to send appointment reminder for org {}: {}",
                    orgAlias, e.getMessage(), e);
        }
    }

    private void sendEventNotification(String orgAlias, String eventType, Map<String, Object> data) {
        // Check if this event type is enabled at all. A per-org row only ever comes
        // into existence when somebody opens Settings > Notifications
        // (NotificationConfigService seeds defaults lazily on read) — org
        // provisioning never writes one. Treating "no row" as "disabled" meant a
        // practice that had never visited that page silently sent no appointment
        // notification at all: no send, no notification_log entry, no error. Fall
        // back to the '__SYSTEM__' default row the way secure-message
        // notifications do, and if even that is absent synthesise an
        // email-enabled default — these events are opt-out, not opt-in. The
        // patient's own Communication Consent below still has the final say.
        var prefOpt = prefRepo.findByOrgAliasAndEventType(orgAlias, eventType);
        if (prefOpt.isEmpty()) {
            prefOpt = prefRepo.findByOrgAliasAndEventType(SYSTEM_ORG_ALIAS, eventType);
        }
        if (prefOpt.isEmpty()) {
            log.debug("No preference row for event '{}' in org '{}' (and no {} default), "
                    + "defaulting to email-enabled", eventType, orgAlias, SYSTEM_ORG_ALIAS);
        }
        var pref = prefOpt.orElseGet(() -> NotificationPreference.builder()
                .orgAlias(orgAlias)
                .eventType(eventType)
                .emailEnabled(true)
                .smsEnabled(false)
                .build());

        // Get patient info from appointment data (must be resolved by caller — FHIR/security
        // context is not available in this @Async method's thread).
        String patientEmail = extractString(data, "patientEmail");
        String patientPhone = extractString(data, "patientPhone");
        String patientName = extractString(data, "patientName");
        Long patientId = extractLong(data, "patientId");

        // Each channel requires BOTH the org's event preference AND the patient's own
        // Communication Consent (Demographics > allowEmail/allowSms) — a practice enabling
        // SMS reminders doesn't override a patient who hasn't consented to text messages.
        boolean patientAllowsEmail = Boolean.TRUE.equals(data.get("patientAllowEmail"));
        boolean patientAllowsSms = Boolean.TRUE.equals(data.get("patientAllowSms"));
        boolean sendEmail = Boolean.TRUE.equals(pref.getEmailEnabled()) && patientAllowsEmail
                && patientEmail != null && !patientEmail.isBlank();
        boolean sendSms = Boolean.TRUE.equals(pref.getSmsEnabled()) && patientAllowsSms
                && patientPhone != null && !patientPhone.isBlank();

        if (!sendEmail && !sendSms) {
            log.info("Skipping {} notification for org {} (patientId={}): emailEnabled={}/consent={}, "
                            + "smsEnabled={}/consent={}", eventType, orgAlias, patientId,
                    pref.getEmailEnabled(), patientAllowsEmail, pref.getSmsEnabled(), patientAllowsSms);
            return;
        }

        // Build template variables — try multiple key patterns for date/time
        String rawDate = extractString(data, "appointmentStartDate",
                extractString(data, "startDate",
                extractString(data, "appointmentDate", "")));
        String rawTime = extractString(data, "appointmentStartTime",
                extractString(data, "startTime",
                extractString(data, "appointmentTime", "")));
        // Fallback: parse from FHIR "start" ISO datetime (e.g. "2026-04-13T10:15:00-05:00")
        if ((rawDate == null || rawDate.isBlank()) && data.containsKey("start")) {
            String startIso = String.valueOf(data.get("start"));
            if (startIso.length() >= 10) {
                rawDate = startIso.substring(0, 10); // yyyy-MM-dd
                if (startIso.length() >= 16 && (rawTime == null || rawTime.isBlank())) {
                    rawTime = startIso.substring(11, 16); // HH:mm
                }
            }
        }
        // Format date for display (YYYY-MM-DD → "March 30, 2026")
        String displayDate = rawDate;
        try {
            if (rawDate != null && rawDate.matches("\\d{4}-\\d{2}-\\d{2}")) {
                displayDate = LocalDate.parse(rawDate).format(DateTimeFormatter.ofPattern("MMMM d, yyyy"));
            }
        } catch (Exception ignored) { /* keep raw */ }
        // Format time for display (HH:mm → "2:00 PM")
        String displayTime = rawTime;
        try {
            if (rawTime != null && rawTime.matches("\\d{2}:\\d{2}")) {
                var t = java.time.LocalTime.parse(rawTime);
                displayTime = t.format(DateTimeFormatter.ofPattern("h:mm a"));
            }
        } catch (Exception ignored) { /* keep raw */ }
        // Include both camelCase and snake_case keys so templates work regardless of naming convention
        String pName = patientName != null ? patientName : "";
        // Provider / location: the caller normally resolves the display name, but
        // different callers (FHIR facade, generic resource controller, scheduler)
        // hand us the value under different keys — and when none of them carried a
        // name the confirmation email went out with a bare "Provider:" / "Location:"
        // line, which is exactly what QA reported. Accept every spelling before
        // giving up.
        String provName = firstNonBlank(data, "providerName", "provider_name", "practitionerName",
                "providerFullName", "provider", "practitioner");
        String locName = firstNonBlank(data, "locationName", "location_name", "facilityName",
                "facility", "locationDisplay", "location");
        String dDate = displayDate != null ? displayDate : "";
        String dTime = displayTime != null ? displayTime : "";
        String prcName = extractString(data, "practiceName", orgAlias);
        String prcPhone = extractString(data, "practicePhone", "");
        Map<String, String> variables = new HashMap<>(Map.of(
                "patientName", pName,
                "patient_name", pName,
                "providerName", provName,
                "provider_name", provName,
                "appointmentDate", dDate,
                "appointment_date", dDate,
                "appointmentTime", dTime,
                "appointment_time", dTime,
                "practiceName", prcName
        ));
        variables.put("practice_name", prcName);
        variables.put("practicePhone", prcPhone);
        variables.put("practice_phone", prcPhone);
        variables.put("portalLink", "");
        variables.put("location_name", locName);
        variables.put("locationName", locName);

        if (sendEmail) {
            sendEmailNotification(orgAlias, eventType, patientEmail, patientId, patientName,
                    displayDate, displayTime, prcName, variables);
        }
        if (sendSms) {
            String smsSubject = buildDefaultSubject(eventType, patientName, displayDate, displayTime, prcName);
            String smsBody = buildDefaultSmsBody(eventType, variables);
            notificationService.send(orgAlias, "sms", patientPhone, smsSubject, smsBody, patientId, "auto_" + eventType);
            log.info("Sent {} SMS to {} for org {}", eventType, patientPhone, orgAlias);
        }
    }

    /** Email send: prefers the org's custom template (subject/HTML body) over the built-in default. */
    private void sendEmailNotification(String orgAlias, String eventType, String patientEmail, Long patientId,
                                        String patientName, String displayDate, String displayTime,
                                        String prcName, Map<String, String> variables) {
        var templateOpt = templateRepo.findByOrgAliasAndTemplateKeyAndChannelType(orgAlias, eventType, "email");

        if (templateOpt.isPresent() && Boolean.TRUE.equals(templateOpt.get().getIsActive())) {
            try {
                var tmpl = templateOpt.get();
                String templateSubject = resolveVars(tmpl.getSubject(), variables);
                // Emails are always sent as HTML (EmailService uses setText(body, true)).
                // An org that authored its own html_body wins — that is a deliberate
                // customisation. Otherwise the row only carries the seeded plain-text
                // body, whose "\n" newlines collapse into the single run-on paragraph
                // QA reported ("Dear X, Your appointment has been confirmed. Date: …
                // Time: … Provider: Location: …"). For the appointment events we own a
                // properly laid-out HTML version of exactly that content — labelled
                // rows, blank ones omitted — so use it instead of a <br/>-ified blob.
                // Anything else still falls back to the plain body.
                String html = tmpl.getHtmlBody();
                String templateBody;
                if (html != null && !html.isBlank()) {
                    templateBody = resolveVars(html, variables);
                } else if (hasStructuredDefaultBody(eventType)) {
                    templateBody = buildDefaultBody(eventType, variables);
                } else {
                    templateBody = resolveVars(plainToHtml(tmpl.getBody()), variables);
                }
                // Use default subject if template subject is empty
                if (templateSubject == null || templateSubject.isBlank()) {
                    templateSubject = buildDefaultSubject(eventType, patientName, displayDate, displayTime, prcName);
                } else {
                    // A custom template's own subject text predates the practice-name
                    // requirement and won't contain {{practiceName}} — prefix it rather
                    // than silently omitting the practice name for orgs with a template.
                    templateSubject = withPracticeName(templateSubject, prcName);
                }
                notificationService.send(
                        orgAlias, "email", patientEmail,
                        templateSubject,
                        templateBody,
                        patientId, "auto_" + eventType);
                log.info("Sent {} email to {} for org {}", eventType, patientEmail, orgAlias);
                return;
            } catch (Exception e) {
                log.warn("Template-based send failed for {}: {}", eventType, e.getMessage());
            }
        }

        // Fallback: send with default subject/body
        String subject = buildDefaultSubject(eventType, patientName, displayDate, displayTime, prcName);
        String body = buildDefaultBody(eventType, variables);
        notificationService.send(orgAlias, "email", patientEmail, subject, body, patientId, "auto_" + eventType);
        log.info("Sent {} email (default template) to {} for org {}", eventType, patientEmail, orgAlias);
    }

    /**
     * Convert a plain-text template body into minimal HTML so its line breaks
     * survive being sent in an HTML email. Used only as a fallback when a
     * template has no dedicated html_body.
     */
    private String plainToHtml(String plain) {
        if (plain == null || plain.isBlank()) {
            return "";
        }
        return "<div style=\"font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;color:#333\">"
                + plain.replace("\r\n", "\n").replace("\n", "<br/>")
                + "</div>";
    }

    /**
     * Events for which {@link #buildDefaultBody} renders a laid-out HTML body
     * (labelled Date / Time / Provider / Location rows). For these we prefer that
     * layout over a plain-text template body, which renders as one run-on
     * paragraph once it is sent as HTML.
     */
    private boolean hasStructuredDefaultBody(String eventType) {
        return "appointment_confirmation".equals(eventType) || "appointment_reminder".equals(eventType);
    }

    /**
     * First non-blank value among {@code keys}, skipping values that are clearly
     * an id or a FHIR reference ("Location/12", "42") rather than a display name —
     * putting one of those in an email reads worse than omitting the line.
     */
    private String firstNonBlank(Map<String, Object> data, String... keys) {
        for (String key : keys) {
            Object val = data.get(key);
            if (val == null) continue;
            String s = String.valueOf(val).trim();
            if (s.isEmpty() || "null".equals(s)) continue;
            if (s.matches("\\d+") || s.matches("[A-Za-z]+/[A-Za-z0-9\\-.]+")) continue;
            return s;
        }
        return "";
    }

    private String resolveVars(String template, Map<String, String> variables) {
        if (template == null) return "";
        String result = template;
        for (var entry : variables.entrySet()) {
            result = result.replace("{{" + entry.getKey() + "}}", entry.getValue());
        }
        return result;
    }

    private String buildDefaultSubject(String eventType, String patientName, String appointmentDate,
                                        String appointmentTime, String practiceName) {
        String dateStr = (appointmentDate != null && !appointmentDate.isBlank())
                ? appointmentDate
                : LocalDate.now().format(DateTimeFormatter.ofPattern("MMMM d, yyyy"));
        // Include time in subject to make each appointment email unique (prevents email threading)
        String timeStr = (appointmentTime != null && !appointmentTime.isBlank())
                ? " at " + appointmentTime
                : "";
        String base = switch (eventType) {
            case "appointment_confirmation" -> "Appointment Confirmation" +
                    (patientName != null ? " for " + patientName : "") + " | " + dateStr + timeStr;
            case "appointment_reminder" -> "Appointment Reminder" +
                    (patientName != null ? " for " + patientName : "") + " | " + dateStr + timeStr;
            case "lab_result_ready" -> "Lab Results Available";
            case "prescription_ready" -> "Prescription Ready for Pickup";
            default -> "Notification from Your Healthcare Provider";
        };
        return withPracticeName(base, practiceName);
    }

    /** Prefixes {@code practiceName} onto a subject unless it's already present (case-insensitive). */
    private String withPracticeName(String subject, String practiceName) {
        if (practiceName == null || practiceName.isBlank()) {
            return subject;
        }
        if (subject.toLowerCase().contains(practiceName.toLowerCase())) {
            return subject;
        }
        return practiceName + ": " + subject;
    }

    private String buildDefaultBody(String eventType, Map<String, String> vars) {
        String name = vars.getOrDefault("patientName", "Patient");
        String provider = vars.getOrDefault("providerName", "");
        String date = vars.getOrDefault("appointmentDate", "");
        String time = vars.getOrDefault("appointmentTime", "");
        String practice = vars.getOrDefault("practiceName", "");
        String location = vars.getOrDefault("location_name", "");
        String phone = vars.getOrDefault("practicePhone", "");

        // Appointment details table: every row is a label/value pair on its own
        // line, and a row whose value never resolved is dropped rather than sent as
        // a dangling "Provider:" (QA 27-Jul).
        StringBuilder details = new StringBuilder("<table style=\"border-collapse:collapse;margin:0 0 16px\">");
        appendDetailRow(details, "Date", date);
        appendDetailRow(details, "Time", time);
        appendDetailRow(details, "Provider", provider);
        appendDetailRow(details, "Location", location);
        details.append("</table>");
        String detailTable = details.toString();
        // "call us at ." with no number reads as a typo — only offer the number
        // when the practice actually has one on file.
        String reschedule = phone.isBlank()
                ? "<p style=\"margin:0 0 16px\">Please arrive 15 minutes early. Contact us if you need to reschedule.</p>"
                : "<p style=\"margin:0 0 16px\">Please arrive 15 minutes early. If you need to reschedule, please call us at "
                    + phone + ".</p>";

        String innerHtml = switch (eventType) {
            case "appointment_confirmation" -> String.format(
                    "<p style=\"margin:0 0 16px\">Dear %s,</p>" +
                    "<p style=\"margin:0 0 16px\">Your appointment has been confirmed.</p>" +
                    "%s" +
                    "%s" +
                    "<p style=\"margin:0 0 16px\">We look forward to seeing you!</p>" +
                    "<p style=\"margin:0\">Thank you,<br/>%s</p>",
                    name, detailTable, reschedule, practice);
            case "appointment_reminder" -> String.format(
                    "<p style=\"margin:0 0 16px\">Dear %s,</p>" +
                    "<p style=\"margin:0 0 16px\">This is a reminder about your upcoming appointment.</p>" +
                    "%s" +
                    "%s" +
                    "<p style=\"margin:0 0 16px\">We look forward to seeing you!</p>" +
                    "<p style=\"margin:0\">Thank you,<br/>%s</p>",
                    name, detailTable, reschedule, practice);
            default -> String.format(
                    "<p style=\"margin:0 0 16px\">Dear %s,</p>" +
                    "<p style=\"margin:0\">You have a new notification from %s.</p>",
                    name, practice);
        };

        // Wrap in a responsive HTML email wrapper for proper alignment
        return "<div style=\"font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#333\">" +
                innerHtml + "</div>";
    }

    /** Plain-text counterpart of {@link #buildDefaultBody} for SMS, which has no HTML rendering. */
    private String buildDefaultSmsBody(String eventType, Map<String, String> vars) {
        String name = vars.getOrDefault("patientName", "Patient");
        String provider = vars.getOrDefault("providerName", "");
        String date = vars.getOrDefault("appointmentDate", "");
        String time = vars.getOrDefault("appointmentTime", "");
        String practice = vars.getOrDefault("practiceName", "");
        String location = vars.getOrDefault("location_name", "");

        StringBuilder details = new StringBuilder();
        appendDetailLine(details, "Date", date);
        appendDetailLine(details, "Time", time);
        appendDetailLine(details, "Provider", provider);
        appendDetailLine(details, "Location", location);

        String intro = switch (eventType) {
            case "appointment_confirmation" -> "Your appointment has been confirmed.";
            case "appointment_reminder" -> "This is a reminder about your upcoming appointment.";
            default -> "You have a new notification from " + practice + ".";
        };

        if ("appointment_confirmation".equals(eventType) || "appointment_reminder".equals(eventType)) {
            return "Dear " + name + ",\n\n" + intro + "\n\n" + details + "\nThank you,\n" + practice;
        }
        return "Dear " + name + ",\n\n" + intro;
    }

    /** Append one "Label: value" line, skipping blanks — mirrors {@link #appendDetailRow}'s HTML behavior. */
    private void appendDetailLine(StringBuilder sb, String label, String value) {
        if (value == null || value.isBlank()) {
            return;
        }
        sb.append(label).append(": ").append(value).append("\n");
    }

    /** Append one label/value row to the appointment-details table, skipping blanks. */
    private void appendDetailRow(StringBuilder table, String label, String value) {
        if (value == null || value.isBlank()) {
            return;
        }
        table.append("<tr><td style=\"padding:4px 12px 4px 0;font-weight:bold;white-space:nowrap\">")
                .append(label)
                .append(":</td><td style=\"padding:4px 0\">")
                .append(value)
                .append("</td></tr>");
    }

    private String extractString(Map<String, Object> data, String key) {
        return extractString(data, key, null);
    }

    private String extractString(Map<String, Object> data, String key, String defaultVal) {
        Object val = data.get(key);
        return val != null ? String.valueOf(val) : defaultVal;
    }

    private Long extractLong(Map<String, Object> data, String key) {
        Object val = data.get(key);
        if (val == null) return null;
        if (val instanceof Number n) return n.longValue();
        try { return Long.parseLong(String.valueOf(val)); } catch (Exception e) { return null; }
    }
}
