package org.ciyex.ehr.billing.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * A fee-sheet price level (mirrors the OpenEMR price-level option list).
 * Configured under Settings → System → Price Level and used to drive the
 * per-encounter charge amount on the Fee Sheet editor.
 */
@Data @Entity @Table(name = "price_level")
@Builder @NoArgsConstructor @AllArgsConstructor
public class PriceLevel {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "option_id", nullable = false, length = 60)
    private String optionId;

    @Column(nullable = false)
    private String title;

    private Integer seq;

    @Column(name = "is_default")
    private Boolean isDefault;

    private Boolean active;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(columnDefinition = "TEXT")
    private String codes;

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
