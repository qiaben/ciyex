package org.ciyex.ehr.portal.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "portal_form_submission")
public class PortalFormSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "org_alias", nullable = false, length = 100)
    private String orgAlias;

    @Column(name = "patient_id", nullable = false, length = 100)
    private String patientId;

    @Column(name = "patient_name", length = 255)
    private String patientName;

    @Column(name = "form_id", nullable = false)
    private Long formId;

    @Column(name = "form_key", nullable = false, length = 100)
    private String formKey;

    @Column(name = "form_title", nullable = false, length = 255)
    private String formTitle;

    @Column(name = "form_description", columnDefinition = "TEXT")
    private String formDescription;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "response_data", nullable = false, columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> responseData = new HashMap<>();

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "pending";

    @Column(name = "submitted_date", nullable = false)
    private Instant submittedDate;

    @Column(name = "reviewed_date")
    private Instant reviewedDate;

    @Column(name = "reviewed_by", length = 255)
    private String reviewedBy;

    @Column(name = "review_note", columnDefinition = "TEXT")
    private String reviewNote;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        createdAt = updatedAt = Instant.now();
        if (submittedDate == null) submittedDate = Instant.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }
}
