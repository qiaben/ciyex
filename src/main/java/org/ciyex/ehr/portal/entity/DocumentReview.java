package org.ciyex.ehr.portal.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data @Entity @Table(name = "document_review")
@Builder @NoArgsConstructor @AllArgsConstructor
public class DocumentReview {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** FHIR DocumentReference ID */
    @Column(name = "fhir_id", nullable = false)
    private String fhirId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "patient_name")
    private String patientName;

    @Column(name = "patient_email")
    private String patientEmail;

    @Column(name = "file_name")
    private String fileName;

    private String category;
    private String description;

    @Column(name = "content_type")
    private String contentType;

    @Column(name = "file_size")
    private Long fileSize;

    /** PENDING, ACCEPTED, REJECTED */
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "reviewer_email")
    private String reviewerEmail;

    @Column(name = "org_alias", nullable = false, length = 100)
    private String orgAlias;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @PrePersist
    void prePersist() { createdAt = LocalDateTime.now(); }
}
