package org.ciyex.ehr.intake.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * One-time, tokenized link that lets a patient open and submit an intake form
 * without logging in. Sent to the patient by SMS or email; the token carries
 * the owning org so the public endpoints need no authentication or tenant
 * header.
 */
@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "intake_token")
public class IntakeToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String token;

    @Column(name = "org_alias", nullable = false, length = 100)
    private String orgAlias;

    @Column(name = "form_id", nullable = false)
    private Long formId;

    /** Existing patient this was sent to; null when the recipient isn't in the system yet. */
    @Column(name = "patient_id", length = 100)
    private String patientId;

    @Column(name = "recipient_name", length = 255)
    private String recipientName;

    @Column(name = "recipient_phone", length = 50)
    private String recipientPhone;

    @Column(name = "recipient_email", length = 255)
    private String recipientEmail;

    /** sent | submitted */
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "sent";

    /** Channel the link (and OTP) is delivered through: SMS | EMAIL. */
    @Column(length = 20)
    private String channel;

    // --- OTP gate: patient must verify a one-time code before the form opens ---
    @Column(name = "otp_code", length = 20)
    private String otpCode;

    @Column(name = "otp_expires_at")
    private Instant otpExpiresAt;

    @Column(name = "otp_sent_at")
    private Instant otpSentAt;

    @Column(name = "otp_attempts")
    @Builder.Default
    private Integer otpAttempts = 0;

    @Column(name = "otp_verified")
    @Builder.Default
    private Boolean otpVerified = false;

    /** Secret issued after a successful OTP verify; required to load prefill and submit. */
    @Column(name = "verification_token", length = 255)
    private String verificationToken;

    @Column(name = "submission_id")
    private Long submissionId;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "used_at")
    private Instant usedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        createdAt = updatedAt = Instant.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }
}
