package org.ciyex.ehr.billing.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * A fee sheet captures the billable charges for an encounter and feeds the
 * Operations → Payments "Encounter Billing" dashboard. Items are stored as
 * JSONB (each: type, code, description, modifiers, price, qty, justify, note, auth).
 */
@Data @Entity @Table(name = "fee_sheet")
@Builder @NoArgsConstructor @AllArgsConstructor
public class FeeSheet {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "encounter_id", length = 64)
    private String encounterId;

    @Column(name = "patient_id", length = 64)
    private String patientId;

    @Column(name = "patient_name")
    private String patientName;

    @Column(name = "price_level", length = 60)
    private String priceLevel;

    @Column(name = "rendering_provider", length = 64)
    private String renderingProvider;

    @Column(name = "rendering_provider_name")
    private String renderingProviderName;

    @Column(name = "supervising_provider", length = 64)
    private String supervisingProvider;

    private BigDecimal total;

    @Column(name = "total_paid")
    private BigDecimal totalPaid;

    @Column(name = "billing_status", length = 40)
    private String billingStatus;

    @Column(name = "billed_mode", length = 40)
    private String billedMode;

    @Column(name = "payment_status", length = 40)
    private String paymentStatus;

    @Column(columnDefinition = "TEXT")
    private String comments;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    @Builder.Default
    private List<Map<String, Object>> items = List.of();

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
