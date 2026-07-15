package org.ciyex.ehr.intake.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ciyex.ehr.fhir.FhirClientService;
import org.ciyex.ehr.intake.dto.IntakePublicView;
import org.ciyex.ehr.notification.dto.NotificationLogDto;
import org.ciyex.ehr.notification.service.NotificationService;
import org.ciyex.ehr.intake.dto.IntakeSendRequest;
import org.ciyex.ehr.intake.entity.IntakeToken;
import org.ciyex.ehr.intake.repository.IntakeTokenRepository;
import org.ciyex.ehr.portal.entity.PortalForm;
import org.ciyex.ehr.portal.entity.PortalFormSubmission;
import org.ciyex.ehr.portal.repository.PortalFormRepository;
import org.ciyex.ehr.portal.repository.PortalFormSubmissionRepository;
import org.hl7.fhir.r4.model.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Patient intake: mint a tokenized link, send it by SMS/email, validate it for
 * the public form page, and save the submission — auto-creating the patient
 * when the link was sent to someone not yet in the system.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class IntakeService {

    private static final String INTAKE_FORM_KEY = "intake";
    private static final String INTAKE_FORM_TITLE = "Patient Intake";

    private final IntakeTokenRepository tokenRepo;
    private final PortalFormRepository formRepo;
    private final PortalFormSubmissionRepository submissionRepo;
    private final FhirClientService fhirClientService;
    private final NotificationService notificationService;

    @Value("${services.portal-url:http://localhost:3000}")
    private String portalUrl;

    /* ------------------------------------------------------------------ send */

    @Transactional
    public Map<String, Object> send(String orgAlias, IntakeSendRequest req) {
        if (orgAlias == null || orgAlias.isBlank()) {
            throw new IllegalArgumentException("No active practice selected.");
        }
        String channel = req.getChannel() == null ? "" : req.getChannel().trim().toUpperCase();
        String phone = trimToNull(req.getPhone());
        String email = trimToNull(req.getEmail());

        if ("SMS".equals(channel)) {
            if (phone == null) {
                throw new IllegalArgumentException("A mobile number is required to send by SMS.");
            }
        } else if ("EMAIL".equals(channel)) {
            if (email == null) {
                throw new IllegalArgumentException("An email address is required to send by email.");
            }
        } else {
            throw new IllegalArgumentException("channel must be SMS or EMAIL.");
        }

        Long formId = resolveIntakeForm(orgAlias).getId();

        String token = UUID.randomUUID().toString().replace("-", "")
                + UUID.randomUUID().toString().replace("-", "");

        IntakeToken entity = IntakeToken.builder()
                .token(token)
                .orgAlias(orgAlias)
                .formId(formId)
                .patientId(trimToNull(req.getPatientId()))
                .recipientName(trimToNull(req.getRecipientName()))
                .recipientPhone(phone)
                .recipientEmail(email)
                .status("sent")
                .expiresAt(Instant.now().plus(72, ChronoUnit.HOURS))
                .build();
        tokenRepo.save(entity);

        String link = portalUrl.replaceAll("/+$", "") + "/intake/" + token;
        String name = entity.getRecipientName() != null ? entity.getRecipientName() : "there";

        // Dispatch via the per-practice notification service so each practice sends
        // from its own SMS/email provider (configured in Settings > Notifications).
        NotificationLogDto sendResult;
        if ("SMS".equals(channel)) {
            sendResult = notificationService.send(orgAlias, "sms", phone, null,
                    "Hi " + name + ", please complete your intake form before your visit: " + link,
                    null, "intake");
        } else {
            String body = "Hello " + name + ",\n\n"
                    + "Please complete your patient intake form before your visit:\n"
                    + link + "\n\nThis link expires in 72 hours.";
            sendResult = notificationService.send(orgAlias, "email", email,
                    "Complete your patient intake form", body, null, "intake");
        }
        if (sendResult != null && "failed".equals(sendResult.getStatus())) {
            throw new IllegalStateException(sendResult.getErrorMessage() != null
                    ? sendResult.getErrorMessage()
                    : "Failed to send the intake form via " + channel);
        }

        Map<String, Object> out = new HashMap<>();
        out.put("link", link);
        out.put("channel", channel);
        return out;
    }

    /* ------------------------------------------------------------ public view */

    public IntakePublicView getPublic(String token) {
        IntakeToken t = tokenRepo.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid intake link"));

        if ("submitted".equals(t.getStatus())) {
            return IntakePublicView.builder().status("submitted").practiceName(t.getOrgAlias()).build();
        }
        if (t.getExpiresAt() != null && t.getExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.GONE, "This intake link has expired");
        }

        Map<String, Object> prefill = new HashMap<>();
        if (t.getRecipientName() != null) {
            String[] parts = t.getRecipientName().trim().split("\\s+", 2);
            prefill.put("firstName", parts[0]);
            if (parts.length > 1) {
                prefill.put("lastName", parts[1]);
            }
        }
        if (t.getRecipientPhone() != null) {
            prefill.put("mobilePhone", t.getRecipientPhone());
        }
        if (t.getRecipientEmail() != null) {
            prefill.put("email", t.getRecipientEmail());
        }

        return IntakePublicView.builder()
                .status("open")
                .practiceName(t.getOrgAlias())
                .prefill(prefill)
                .build();
    }

    /* ---------------------------------------------------------------- submit */

    @Transactional
    public void submit(String token, Map<String, Object> responses) {
        IntakeToken t = tokenRepo.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid intake link"));

        if ("submitted".equals(t.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This intake form was already submitted");
        }
        if (t.getExpiresAt() != null && t.getExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.GONE, "This intake link has expired");
        }

        Map<String, Object> data = responses == null ? new HashMap<>() : responses;
        String orgAlias = t.getOrgAlias();
        String patientId = t.getPatientId();

        // Sent to someone not yet in the system → create the patient from their answers.
        if (patientId == null || patientId.isBlank()) {
            patientId = createPatient(orgAlias, data);
        }

        PortalFormSubmission submission = PortalFormSubmission.builder()
                .orgAlias(orgAlias)
                .patientId(patientId)
                .patientName(displayName(data, t.getRecipientName()))
                .formId(t.getFormId())
                .formKey(INTAKE_FORM_KEY)
                .formTitle(INTAKE_FORM_TITLE)
                .responseData(data)
                .status("pending")
                .submittedDate(Instant.now())
                .build();
        submissionRepo.save(submission);

        t.setStatus("submitted");
        t.setUsedAt(Instant.now());
        t.setSubmissionId(submission.getId());
        t.setPatientId(patientId);
        tokenRepo.save(t);

        log.info("Intake submitted for org={} patient={} submissionId={}", orgAlias, patientId, submission.getId());
    }

    /* --------------------------------------------------------------- helpers */

    private PortalForm resolveIntakeForm(String orgAlias) {
        return formRepo.findByOrgAliasAndFormKey(orgAlias, INTAKE_FORM_KEY)
                .orElseGet(() -> formRepo.save(PortalForm.builder()
                        .orgAlias(orgAlias)
                        .formKey(INTAKE_FORM_KEY)
                        .formType("intake")
                        .title(INTAKE_FORM_TITLE)
                        .description("Patient intake form")
                        .active(true)
                        .position(0)
                        .build()));
    }

    private String createPatient(String orgAlias, Map<String, Object> r) {
        Patient patient = new Patient();

        String first = str(r, "firstName");
        String last = str(r, "lastName");
        if (first != null || last != null) {
            HumanName name = patient.addName();
            if (last != null) {
                name.setFamily(last);
            }
            if (first != null) {
                name.addGiven(first);
            }
        }

        String email = str(r, "email");
        if (email != null) {
            patient.addTelecom().setSystem(ContactPoint.ContactPointSystem.EMAIL).setValue(email);
        }
        String mobile = str(r, "mobilePhone");
        if (mobile != null) {
            patient.addTelecom()
                    .setSystem(ContactPoint.ContactPointSystem.PHONE)
                    .setUse(ContactPoint.ContactPointUse.MOBILE)
                    .setValue(mobile);
        }
        String home = str(r, "homePhone");
        if (home != null) {
            patient.addTelecom()
                    .setSystem(ContactPoint.ContactPointSystem.PHONE)
                    .setUse(ContactPoint.ContactPointUse.HOME)
                    .setValue(home);
        }

        String sex = str(r, "sex");
        if (sex != null) {
            try {
                patient.setGender(Enumerations.AdministrativeGender.fromCode(sex.toLowerCase()));
            } catch (Exception ignored) {
                // free-text sex value that isn't a FHIR code — leave gender unset
            }
        }

        String dob = str(r, "dateOfBirth");
        if (dob != null && dob.matches("\\d{4}-\\d{2}-\\d{2}")) {
            patient.setBirthDateElement(new DateType(dob));
        }

        String line1 = str(r, "addressLine1");
        String city = str(r, "city");
        if (line1 != null || city != null) {
            Address addr = patient.addAddress();
            if (line1 != null) {
                addr.addLine(line1);
            }
            String line2 = str(r, "addressLine2");
            if (line2 != null) {
                addr.addLine(line2);
            }
            if (city != null) {
                addr.setCity(city);
            }
            String state = str(r, "state");
            if (state != null) {
                addr.setState(state);
            }
            String postal = str(r, "postalCode");
            if (postal != null) {
                addr.setPostalCode(postal);
            }
            String country = str(r, "country");
            if (country != null) {
                addr.setCountry(country);
            }
        }

        patient.setActive(true);
        var outcome = fhirClientService.create(patient, orgAlias);
        return outcome.getId().getIdPart();
    }

    private static String displayName(Map<String, Object> r, String fallback) {
        String first = str(r, "firstName");
        String last = str(r, "lastName");
        if (first != null || last != null) {
            return ((first == null ? "" : first) + " " + (last == null ? "" : last)).trim();
        }
        return fallback;
    }

    private static String str(Map<String, Object> m, String key) {
        if (m == null) {
            return null;
        }
        Object v = m.get(key);
        if (v == null) {
            return null;
        }
        String s = v.toString().trim();
        return s.isEmpty() ? null : s;
    }

    private static String trimToNull(String s) {
        if (s == null) {
            return null;
        }
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
