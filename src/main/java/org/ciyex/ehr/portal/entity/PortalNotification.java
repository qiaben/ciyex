package org.ciyex.ehr.portal.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data @Entity @Table(name = "portal_notification")
@Builder @NoArgsConstructor @AllArgsConstructor
public class PortalNotification {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "patient_email")
    private String patientEmail;

    /** e.g. document_accepted, document_rejected */
    @Column(nullable = false, length = 50)
    private String type;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "org_alias", nullable = false, length = 100)
    private String orgAlias;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() { createdAt = LocalDateTime.now(); }
}
