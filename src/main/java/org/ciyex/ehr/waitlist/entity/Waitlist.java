package org.ciyex.ehr.waitlist.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * A patient waiting for an appointment slot. Backs the Schedule sidebar
 * "Waitlist" panel and the calendar "Add to Waitlist" quick action. Scoped to a
 * practice via {@code org_alias} (app-level filter, consistent with fee_sheet).
 */
@Data @Entity @Table(name = "waitlist")
@Builder @NoArgsConstructor @AllArgsConstructor
public class Waitlist {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", length = 64)
    private String patientId;

    @Column(name = "patient_name")
    private String patientName;

    @Column(name = "requested_type", length = 120)
    private String requestedType;

    /** Requested date/time as the client sends it (ISO string); kept as text so
     *  partial values (date-only) round-trip without timezone coercion. */
    @Column(name = "requested_date", length = 64)
    private String requestedDate;

    private Integer priority;

    @Column(length = 40)
    private String status;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "org_alias", nullable = false, length = 100)
    private String orgAlias;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate
    void preUpdate() { updatedAt = LocalDateTime.now(); }
}
