package org.ciyex.ehr.notification.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Entity @Table(name = "notification_config",
        uniqueConstraints = @UniqueConstraint(columnNames = {"org_alias", "channel_type"}))
@Builder @NoArgsConstructor @AllArgsConstructor
public class NotificationConfig {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String channelType;
    private String provider;
    private Boolean enabled;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String config;
    private String senderName;
    private String senderAddress;
    private Integer dailyLimit;
    private Integer sentToday;
    private LocalDate lastResetDate;
    private String orgAlias;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate
    void preUpdate() { updatedAt = LocalDateTime.now(); }
}
