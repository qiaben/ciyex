package org.ciyex.ehr.notification;

import org.ciyex.ehr.notification.entity.NotificationPreference;
import org.ciyex.ehr.notification.repository.NotificationPreferenceRepository;
import org.ciyex.ehr.notification.repository.NotificationTemplateRepository;
import org.ciyex.ehr.notification.service.AppointmentNotificationService;
import org.ciyex.ehr.notification.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Regression test for "appointment created on production but the patient never
 * received the confirmation email".
 *
 * A per-org {@code notification_preference} row is created only lazily, when
 * somebody opens Settings &gt; Notifications — org provisioning never writes one.
 * The service used to treat a missing row as "disabled" and return silently, so
 * an org that had never visited that page produced no send, no
 * {@code notification_log} entry and no error. dev/stage had the rows (QA had
 * opened the page long ago); production did not.
 *
 * The fix falls back to the {@code __SYSTEM__} default row — the same pattern
 * {@code SecureMessageNotificationService} already uses — and treats the events
 * as opt-out rather than opt-in when neither row exists. An explicit
 * {@code email_enabled = false} must still be honoured.
 */
class AppointmentNotificationPreferenceFallbackTest {

    private static final String ORG = "acme-clinic";
    private static final String SYSTEM_ORG = "__SYSTEM__";
    private static final String EVENT = "appointment_confirmation";

    private NotificationService notificationService;
    private NotificationPreferenceRepository prefRepo;
    private NotificationTemplateRepository templateRepo;
    private AppointmentNotificationService service;

    @BeforeEach
    void setUp() {
        notificationService = mock(NotificationService.class);
        prefRepo = mock(NotificationPreferenceRepository.class);
        templateRepo = mock(NotificationTemplateRepository.class);
        service = new AppointmentNotificationService(notificationService, prefRepo, templateRepo);

        // No org-authored template — the service falls back to its built-in body.
        when(templateRepo.findByOrgAliasAndTemplateKeyAndChannelType(any(), any(), any()))
                .thenReturn(Optional.empty());
    }

    private Map<String, Object> appointment() {
        Map<String, Object> data = new HashMap<>();
        data.put("patientEmail", "patient@example.com");
        data.put("patientName", "Jane Doe");
        data.put("patientId", 42L);
        data.put("start", "2026-08-05T10:15:00-05:00");
        // Communication Consent — a channel needs the org preference AND the
        // patient's own opt-in before anything is sent.
        data.put("patientAllowEmail", true);
        return data;
    }

    private void stubPrefs(NotificationPreference orgPref, NotificationPreference systemPref) {
        when(prefRepo.findByOrgAliasAndEventType(ORG, EVENT)).thenReturn(Optional.ofNullable(orgPref));
        when(prefRepo.findByOrgAliasAndEventType(SYSTEM_ORG, EVENT)).thenReturn(Optional.ofNullable(systemPref));
    }

    private NotificationPreference pref(String orgAlias, boolean emailEnabled) {
        return NotificationPreference.builder()
                .orgAlias(orgAlias).eventType(EVENT)
                .emailEnabled(emailEnabled).smsEnabled(false)
                .timing("immediate").build();
    }

    private void verifySent() {
        verify(notificationService).send(eq(ORG), eq("email"), eq("patient@example.com"),
                any(), any(), anyLong(), eq("auto_" + EVENT));
    }

    private void verifyNotSent() {
        verify(notificationService, never()).send(any(), any(), any(), any(), any(), any(), any());
    }

    /** The production case: neither an org row nor a __SYSTEM__ row exists. */
    @Test
    void sendsWhenNoPreferenceRowExistsAtAll() {
        stubPrefs(null, null);
        service.onAppointmentCreated(ORG, appointment());
        verifySent();
    }

    /** An org that never opened Settings > Notifications inherits the __SYSTEM__ default. */
    @Test
    void sendsWhenOrgRowMissingButSystemDefaultEnabled() {
        stubPrefs(null, pref(SYSTEM_ORG, true));
        service.onAppointmentCreated(ORG, appointment());
        verifySent();
    }

    /** An explicit per-org opt-out still wins over the enabled __SYSTEM__ default. */
    @Test
    void doesNotSendWhenOrgExplicitlyDisabled() {
        stubPrefs(pref(ORG, false), pref(SYSTEM_ORG, true));
        service.onAppointmentCreated(ORG, appointment());
        verifyNotSent();
    }

    /** Turning the event off platform-wide suppresses orgs that have no row of their own. */
    @Test
    void doesNotSendWhenSystemDefaultDisabledAndNoOrgRow() {
        stubPrefs(null, pref(SYSTEM_ORG, false));
        service.onAppointmentCreated(ORG, appointment());
        verifyNotSent();
    }

    /** A missing patient email is still a hard stop, regardless of preferences. */
    @Test
    void doesNotSendWhenPatientHasNoEmail() {
        stubPrefs(null, null);
        Map<String, Object> data = appointment();
        data.remove("patientEmail");
        service.onAppointmentCreated(ORG, data);
        verifyNotSent();
    }

    /**
     * The defaulted-to-enabled preference must not override the patient's own
     * Communication Consent — a patient who has not opted in to email still
     * gets nothing, even when no preference row exists anywhere.
     */
    @Test
    void doesNotSendWhenPatientHasNotConsentedToEmail() {
        stubPrefs(null, null);
        Map<String, Object> data = appointment();
        data.put("patientAllowEmail", false);
        service.onAppointmentCreated(ORG, data);
        verifyNotSent();
    }
}
