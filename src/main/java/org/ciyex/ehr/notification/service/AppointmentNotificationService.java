package org.ciyex.ehr.notification.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
        // Check if this event type is enabled for email
        var prefOpt = prefRepo.findByOrgAliasAndEventType(orgAlias, eventType);
        if (prefOpt.isEmpty()) {
            log.debug("No preference found for event '{}' in org '{}', skipping", eventType, orgAlias);
            return;
        }

        var pref = prefOpt.get();
        if (!Boolean.TRUE.equals(pref.getEmailEnabled())) {
            log.debug("Email disabled for event '{}' in org '{}', skipping", eventType, orgAlias);
            return;
        }

        // Get patient info from appointment data (email must be resolved by caller)
        String patientEmail = extractString(data, "patientEmail");
        String patientName = extractString(data, "patientName");
        Long patientId = extractLong(data, "patientId");

        if (patientEmail == null || patientEmail.isBlank()) {
            log.info("No patient email found for notification (event={}, patientId={}), skipping", eventType, patientId);
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
        String provName = extractString(data, "providerName", "");
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
        variables.put("location_name", extractString(data, "locationName", ""));

        // Try to send using template first
        String templateKey = eventType;
        var templateOpt = templateRepo.findByOrgAliasAndTemplateKeyAndChannelType(
                orgAlias, templateKey, "email");

        if (templateOpt.isPresent() && Boolean.TRUE.equals(templateOpt.get().getIsActive())) {
            try {
                String templateSubject = resolveVars(templateOpt.get().getSubject(), variables);
                String templateBody = resolveVars(templateOpt.get().getBody(), variables);
                // Use default subject if template subject is empty
                if (templateSubject == null || templateSubject.isBlank()) {
                    templateSubject = buildDefaultSubject(eventType, patientName, displayDate, displayTime);
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
        String subject = buildDefaultSubject(eventType, patientName, displayDate, displayTime);
        String body = buildDefaultBody(eventType, variables);
        notificationService.send(orgAlias, "email", patientEmail, subject, body, patientId, "auto_" + eventType);
        log.info("Sent {} email (default template) to {} for org {}", eventType, patientEmail, orgAlias);
    }

    private String resolveVars(String template, Map<String, String> variables) {
        if (template == null) return "";
        String result = template;
        for (var entry : variables.entrySet()) {
            result = result.replace("{{" + entry.getKey() + "}}", entry.getValue());
        }
        return result;
    }

    private String buildDefaultSubject(String eventType, String patientName, String appointmentDate) {
        return buildDefaultSubject(eventType, patientName, appointmentDate, null);
    }

    private String buildDefaultSubject(String eventType, String patientName, String appointmentDate, String appointmentTime) {
        String dateStr = (appointmentDate != null && !appointmentDate.isBlank())
                ? appointmentDate
                : LocalDate.now().format(DateTimeFormatter.ofPattern("MMMM d, yyyy"));
        // Include time in subject to make each appointment email unique (prevents email threading)
        String timeStr = (appointmentTime != null && !appointmentTime.isBlank())
                ? " at " + appointmentTime
                : "";
        return switch (eventType) {
            case "appointment_confirmation" -> "Appointment Confirmation" +
                    (patientName != null ? " for " + patientName : "") + " | " + dateStr + timeStr;
            case "appointment_reminder" -> "Appointment Reminder" +
                    (patientName != null ? " for " + patientName : "") + " | " + dateStr + timeStr;
            case "lab_result_ready" -> "Lab Results Available";
            case "prescription_ready" -> "Prescription Ready for Pickup";
            default -> "Notification from Your Healthcare Provider";
        };
    }

    private String buildDefaultBody(String eventType, Map<String, String> vars) {
        String name = vars.getOrDefault("patientName", "Patient");
        String provider = vars.getOrDefault("providerName", "your provider");
        String date = vars.getOrDefault("appointmentDate", "");
        String time = vars.getOrDefault("appointmentTime", "");
        String practice = vars.getOrDefault("practiceName", "");
        String location = vars.getOrDefault("location_name", "");

        String innerHtml = switch (eventType) {
            case "appointment_confirmation" -> String.format(
                    "<p style=\"margin:0 0 16px\">Dear %s,</p>" +
                    "<p style=\"margin:0 0 16px\">Your appointment has been confirmed.</p>" +
                    "<table style=\"border-collapse:collapse;margin:0 0 16px\">" +
                    "<tr><td style=\"padding:4px 12px 4px 0;font-weight:bold\">Date:</td><td style=\"padding:4px 0\">%s</td></tr>" +
                    "<tr><td style=\"padding:4px 12px 4px 0;font-weight:bold\">Time:</td><td style=\"padding:4px 0\">%s</td></tr>" +
                    "<tr><td style=\"padding:4px 12px 4px 0;font-weight:bold\">Provider:</td><td style=\"padding:4px 0\">%s</td></tr>" +
                    (location.isBlank() ? "" : "<tr><td style=\"padding:4px 12px 4px 0;font-weight:bold\">Location:</td><td style=\"padding:4px 0\">" + location + "</td></tr>") +
                    "</table>" +
                    "<p style=\"margin:0 0 16px\">We look forward to seeing you!</p>" +
                    "<p style=\"margin:0\">Thank you,<br/>%s</p>",
                    name, date, time, provider, practice);
            case "appointment_reminder" -> String.format(
                    "<p style=\"margin:0 0 16px\">Dear %s,</p>" +
                    "<p style=\"margin:0 0 16px\">This is a reminder about your upcoming appointment.</p>" +
                    "<table style=\"border-collapse:collapse;margin:0 0 16px\">" +
                    "<tr><td style=\"padding:4px 12px 4px 0;font-weight:bold\">Date:</td><td style=\"padding:4px 0\">%s</td></tr>" +
                    "<tr><td style=\"padding:4px 12px 4px 0;font-weight:bold\">Time:</td><td style=\"padding:4px 0\">%s</td></tr>" +
                    "<tr><td style=\"padding:4px 12px 4px 0;font-weight:bold\">Provider:</td><td style=\"padding:4px 0\">%s</td></tr>" +
                    (location.isBlank() ? "" : "<tr><td style=\"padding:4px 12px 4px 0;font-weight:bold\">Location:</td><td style=\"padding:4px 0\">" + location + "</td></tr>") +
                    "</table>" +
                    "<p style=\"margin:0 0 16px\">We look forward to seeing you!</p>" +
                    "<p style=\"margin:0\">Thank you,<br/>%s</p>",
                    name, date, time, provider, practice);
            default -> String.format(
                    "<p style=\"margin:0 0 16px\">Dear %s,</p>" +
                    "<p style=\"margin:0\">You have a new notification from %s.</p>",
                    name, practice);
        };

        // Wrap in a responsive HTML email wrapper for proper alignment
        return "<div style=\"font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#333\">" +
                innerHtml + "</div>";
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
