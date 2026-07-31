package org.ciyex.ehr.intake.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ciyex.ehr.fhir.FhirClientService;
import org.ciyex.ehr.fhir.GenericFhirResourceService;
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
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
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
    private final GenericFhirResourceService fhirResourceService;
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
                .channel(channel)
                .status("sent")
                .expiresAt(Instant.now().plus(72, ChronoUnit.HOURS))
                .build();
        tokenRepo.save(entity);

        String link = portalUrl.replaceAll("/+$", "") + "/intake/" + token;
        String name = entity.getRecipientName() != null ? entity.getRecipientName() : "there";

        // Matches the appointment-confirmation email's layout (labeled lines,
        // practice-name signoff) so patients see a consistent format across
        // the app's emails and texts.
        String body = "Dear " + name + ",\n\n"
                + "Please complete your patient intake form before your visit.\n\n"
                + "Form Link: " + link + "\n"
                + "Expires: " + formatExpiry(entity.getExpiresAt()) + "\n\n"
                + "Thank you,\n" + resolvePracticeName(orgAlias);

        // Dispatch via the per-practice notification service so each practice sends
        // from its own SMS/email provider (configured in Settings > Notifications).
        NotificationLogDto sendResult;
        if ("SMS".equals(channel)) {
            sendResult = notificationService.send(orgAlias, "sms", phone, null, body, null, "intake");
        } else {
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

    private static final DateTimeFormatter EXPIRY_FORMAT = DateTimeFormatter.ofPattern("MMMM d, yyyy 'at' h:mm a");

    /** Same date/time style as the appointment-confirmation email
     *  (AppointmentNotificationService: "MMMM d, yyyy" / "h:mm a"). */
    private String formatExpiry(Instant expiresAt) {
        return expiresAt.atZone(ZoneId.systemDefault()).format(EXPIRY_FORMAT);
    }

    /** Best-effort practice display name (Settings > Practice) for the email
     *  signoff — falls back to the raw org alias slug when no practice record
     *  exists yet, same fallback SettingsController.findFirstPractice() uses. */
    private String resolvePracticeName(String orgAlias) {
        try {
            Map<String, Object> result = fhirResourceService.listAll("practice", 0, 1);
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> content = (List<Map<String, Object>>) result.get("content");
            if (content != null && !content.isEmpty()) {
                Object name = content.get(0).get("name");
                if (name != null && !String.valueOf(name).isBlank()) { return String.valueOf(name); }
            }
        } catch (Exception e) {
            log.debug("Could not resolve practice name for {}: {}", orgAlias, e.getMessage());
        }
        return orgAlias;
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

        // Gate the form behind the OTP: don't reveal any prefill (PII) until the
        // patient proves they control the phone/email the link was sent to.
        return IntakePublicView.builder()
                .status("otp_required")
                .practiceName(t.getOrgAlias())
                .channel(t.getChannel())
                .maskedRecipient(maskedRecipient(t))
                .build();
    }

    /* ------------------------------------------------------------------- otp */

    private static final int OTP_TTL_MIN = 10;
    private static final long OTP_RESEND_COOLDOWN_SEC = 30;
    private static final int OTP_MAX_ATTEMPTS = 5;

    /** Send (or resend) a one-time code to the channel the intake link was sent to. */
    @Transactional
    public IntakePublicView sendOtp(String token) {
        IntakeToken t = requireOpenToken(token);
        if (t.getOtpSentAt() != null
                && t.getOtpSentAt().isAfter(Instant.now().minusSeconds(OTP_RESEND_COOLDOWN_SEC))) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Please wait a few seconds before requesting another code.");
        }
        String code = generateOtp();
        t.setOtpCode(code);
        t.setOtpExpiresAt(Instant.now().plus(OTP_TTL_MIN, ChronoUnit.MINUTES));
        t.setOtpSentAt(Instant.now());
        t.setOtpAttempts(0);
        t.setOtpVerified(false);
        tokenRepo.save(t);

        String channel = t.getChannel();
        String recipient = "SMS".equalsIgnoreCase(channel) ? t.getRecipientPhone() : t.getRecipientEmail();
        String msg = "Your intake verification code is " + code + ". It expires in " + OTP_TTL_MIN + " minutes.";
        try {
            if ("SMS".equalsIgnoreCase(channel)) {
                notificationService.send(t.getOrgAlias(), "sms", recipient, null, msg, null, "intake_otp");
            } else {
                notificationService.send(t.getOrgAlias(), "email", recipient,
                        "Your intake verification code", msg, null, "intake_otp");
            }
        } catch (Exception e) {
            log.warn("Intake OTP send failed for token {}: {}", token, e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Could not send the verification code. Please try again.");
        }
        return IntakePublicView.builder()
                .status("otp_sent")
                .channel(channel)
                .maskedRecipient(maskedRecipient(t))
                .build();
    }

    /** Verify the entered code; on success issue a verification token and return prefill. */
    @Transactional
    public IntakePublicView verifyOtp(String token, String code) {
        IntakeToken t = requireOpenToken(token);
        if (t.getOtpCode() == null || t.getOtpExpiresAt() == null
                || t.getOtpExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Your code has expired. Please request a new one.");
        }
        if (t.getOtpAttempts() != null && t.getOtpAttempts() >= OTP_MAX_ATTEMPTS) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Too many incorrect attempts. Please request a new code.");
        }
        String entered = code == null ? "" : code.trim();
        if (!entered.equals(t.getOtpCode())) {
            t.setOtpAttempts((t.getOtpAttempts() == null ? 0 : t.getOtpAttempts()) + 1);
            tokenRepo.save(t);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Incorrect code. Please try again.");
        }
        String verification = UUID.randomUUID().toString().replace("-", "");
        t.setOtpVerified(true);
        t.setVerificationToken(verification);
        t.setOtpCode(null);
        tokenRepo.save(t);

        return IntakePublicView.builder()
                .status("open")
                .practiceName(t.getOrgAlias())
                .verificationToken(verification)
                .prefill(buildPrefill(t))
                .build();
    }

    private IntakeToken requireOpenToken(String token) {
        IntakeToken t = tokenRepo.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid intake link"));
        if ("submitted".equals(t.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This intake form was already submitted");
        }
        if (t.getExpiresAt() != null && t.getExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.GONE, "This intake link has expired");
        }
        return t;
    }

    private static Map<String, Object> buildPrefill(IntakeToken t) {
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
        return prefill;
    }

    private static String generateOtp() {
        return String.format("%06d", new java.security.SecureRandom().nextInt(1_000_000));
    }

    private static String maskedRecipient(IntakeToken t) {
        if ("SMS".equalsIgnoreCase(t.getChannel()) && t.getRecipientPhone() != null) {
            String p = t.getRecipientPhone().replaceAll("[^0-9]", "");
            String last4 = p.length() >= 4 ? p.substring(p.length() - 4) : p;
            return "•••• " + last4;
        }
        String email = t.getRecipientEmail();
        if (email != null && email.contains("@")) {
            int at = email.indexOf('@');
            String user = email.substring(0, at);
            String shown = user.isEmpty() ? "" : user.substring(0, 1);
            return shown + "•••" + email.substring(at);
        }
        return "your contact on file";
    }

    /* ---------------------------------------------------------------- submit */

    @Transactional
    public void submit(String token, Map<String, Object> responses, String verificationToken) {
        IntakeToken t = tokenRepo.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid intake link"));

        if ("submitted".equals(t.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This intake form was already submitted");
        }
        if (t.getExpiresAt() != null && t.getExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.GONE, "This intake link has expired");
        }
        // Enforce the OTP gate: this session must have verified the code.
        if (!Boolean.TRUE.equals(t.getOtpVerified())
                || t.getVerificationToken() == null
                || !t.getVerificationToken().equals(verificationToken)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "Please verify the code sent to you before submitting.");
        }

        Map<String, Object> data = responses == null ? new HashMap<>() : responses;
        String orgAlias = t.getOrgAlias();
        String patientId = t.getPatientId();

        // Sent to someone not yet in the system → create the patient from their answers.
        if (patientId == null || patientId.isBlank()) {
            patientId = createPatient(orgAlias, data);
        }

        // Populate the intake insurance onto the patient's Insurance page (Coverage records).
        try {
            createCoverages(orgAlias, patientId, data);
        } catch (Exception e) {
            log.warn("Intake: failed to create coverages for patient {}: {}", patientId, e.getMessage());
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
        String middle = str(r, "middleInitial");
        if (first != null || last != null) {
            HumanName name = patient.addName();
            if (last != null) {
                name.setFamily(last);
            }
            if (first != null) {
                name.addGiven(first);
            }
            if (middle != null) {
                name.addGiven(middle);
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
        String work = str(r, "workPhone");
        if (work != null) {
            patient.addTelecom()
                    .setSystem(ContactPoint.ContactPointSystem.PHONE)
                    .setUse(ContactPoint.ContactPointUse.WORK)
                    .setValue(work);
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
        String patientId = outcome.getId().getIdPart();

        // Surface the intake answers on the chart's Demographics page. The chart merges
        // the local form_data table over the FHIR fields, so we store the exact
        // demographics keys the edit form uses — only the intake fields that map to an
        // existing demographics field (no new fields, no extra phone numbers).
        storeDemographics(orgAlias, patientId, r);
        return patientId;
    }

    /** Store only the intake fields that have a matching Demographics-page field. */
    private void storeDemographics(String orgAlias, String patientId, Map<String, Object> r) {
        Map<String, Object> demo = new HashMap<>();
        putIf(demo, "firstName", str(r, "firstName"));
        putIf(demo, "lastName", str(r, "lastName"));
        putIf(demo, "middleName", str(r, "middleInitial"));
        putIf(demo, "dateOfBirth", str(r, "dateOfBirth"));
        putIf(demo, "gender", mapGender(str(r, "sex")));
        putIf(demo, "ssn", str(r, "ssn"));
        putIf(demo, "maritalStatus", mapMarital(str(r, "maritalStatus")));
        putIf(demo, "race", str(r, "race"));
        putIf(demo, "ethnicity", str(r, "ethnicity"));
        putIf(demo, "preferredLanguage", str(r, "language"));
        putIf(demo, "phoneNumber", str(r, "mobilePhone"));
        putIf(demo, "homePhone", str(r, "homePhone"));
        putIf(demo, "workPhone", str(r, "workPhone"));
        putIf(demo, "email", str(r, "email"));
        putIf(demo, "address", composeAddress(r));
        if (!demo.isEmpty()) {
            fhirResourceService.storeFormData("Patient", patientId, orgAlias, demo);
        }
    }

    /** Create Coverage records so the intake insurance shows on the patient's Insurance page. */
    private void createCoverages(String orgAlias, String patientId, Map<String, Object> r) {
        createCoverage(orgAlias, patientId, r, "primary", 1);
        createCoverage(orgAlias, patientId, r, "secondary", 2);
    }

    private void createCoverage(String orgAlias, String patientId, Map<String, Object> r, String prefix, int order) {
        String company = str(r, prefix + "InsuranceCompany");
        String subscriberId = str(r, prefix + "SubscriberId");
        String group = str(r, prefix + "GroupId");
        String planName = str(r, prefix + "PlanName");
        if (company == null && subscriberId == null && group == null && planName == null) {
            return; // nothing entered for this tier
        }
        String planType = str(r, prefix + "PlanType");
        String copay = str(r, prefix + "Copay");
        String effective = str(r, prefix + "EffectiveDate");
        String termination = str(r, prefix + "TerminationDate");
        String insuredName = str(r, prefix + "InsuredName");
        String insuredDob = str(r, prefix + "InsuredDob");
        String relationship = str(r, prefix + "RelationshipToInsured");

        Coverage cov = new Coverage();
        cov.setStatus(Coverage.CoverageStatus.ACTIVE);
        cov.setBeneficiary(new Reference("Patient/" + patientId));
        cov.addPayor(new Reference().setDisplay(company != null ? company : "Unknown Payor"));
        if (subscriberId != null) {
            cov.setSubscriberId(subscriberId);
        }
        cov.setOrder(order);
        if (group != null) {
            cov.addClass_()
                    .setValue(group)
                    .setType(new CodeableConcept().addCoding(new Coding()
                            .setSystem("http://terminology.hl7.org/CodeSystem/coverage-class").setCode("group")));
        }
        String covId = fhirClientService.create(cov, orgAlias).getId().getIdPart();

        // Mirror the chart's Insurance tab fields so the intake insurance fully populates it.
        String tier = order == 1 ? "primary" : order == 2 ? "secondary" : "tertiary";
        Map<String, Object> ins = new HashMap<>();
        putIf(ins, "insuranceType", tier);
        putIf(ins, "status", "active");
        putIf(ins, "payerName", company);
        putIf(ins, "insuranceCompany", company);
        putIf(ins, "planName", planName);
        putIf(ins, "policyType", planType);
        putIf(ins, "policyNumber", subscriberId);
        putIf(ins, "groupNumber", group);
        putIf(ins, "copayAmount", copay);
        putIf(ins, "policyEffectiveDate", effective);
        putIf(ins, "policyEndDate", termination);
        putIf(ins, "priority", String.valueOf(order));
        putIf(ins, "subscriberRelationship", mapSubscriberRelationship(relationship));
        putIf(ins, "subscriberName", insuredName);
        putIf(ins, "subscriberDOB", insuredDob);
        fhirResourceService.storeFormData("Coverage", covId, orgAlias, ins);
    }

    /** Intake relationship label → Insurance-tab subscriberRelationship value (self/spouse/child/parent/other). */
    private static String mapSubscriberRelationship(String rel) {
        if (rel == null) {
            return null;
        }
        String v = rel.trim().toLowerCase();
        return switch (v) {
            case "self", "spouse", "child", "parent" -> v;
            default -> "other";
        };
    }

    private static void putIf(Map<String, Object> m, String key, String value) {
        if (value != null && !value.isBlank()) {
            m.put(key, value);
        }
    }

    /** Intake sex (Female/Male/Transgender) → Demographics "Sex at Birth" (Male/Female/Other/Unknown). */
    private static String mapGender(String sex) {
        if (sex == null) {
            return null;
        }
        return switch (sex.trim().toLowerCase()) {
            case "male" -> "Male";
            case "female" -> "Female";
            default -> "Other";
        };
    }

    /** Intake marital labels → Demographics marital options (Legally Separated → Separated). */
    private static String mapMarital(String m) {
        if (m == null) {
            return null;
        }
        return "Legally Separated".equalsIgnoreCase(m.trim()) ? "Separated" : m.trim();
    }

    private static String composeAddress(Map<String, Object> r) {
        StringBuilder sb = new StringBuilder();
        String line1 = str(r, "addressLine1");
        String line2 = str(r, "addressLine2");
        String city = str(r, "city");
        String state = str(r, "state");
        String postal = str(r, "postalCode");
        String country = str(r, "country");
        if (line1 != null) {
            sb.append(line1);
        }
        if (line2 != null) {
            sb.append(sb.length() > 0 ? ", " : "").append(line2);
        }
        String cityState = (city != null ? city : "")
                + (state != null ? (city != null ? ", " : "") + state : "")
                + (postal != null ? " " + postal : "");
        if (!cityState.isBlank()) {
            sb.append(sb.length() > 0 ? ", " : "").append(cityState.trim());
        }
        if (country != null) {
            sb.append(sb.length() > 0 ? ", " : "").append(country);
        }
        return sb.length() > 0 ? sb.toString() : null;
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
