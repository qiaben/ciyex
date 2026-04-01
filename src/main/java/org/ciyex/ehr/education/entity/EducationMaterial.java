package org.ciyex.ehr.education.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;

@Data @Entity @Table(name = "education_material")
@Builder @NoArgsConstructor @AllArgsConstructor
public class EducationMaterial {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String category;
    private String contentType;
    @Column(columnDefinition = "TEXT")
    private String content;
    private String externalUrl;
    private String language;
    private String audience;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String tags;
    private String author;
    private String source;
    private Boolean isActive;
    private Integer viewCount;
    private String orgAlias;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate
    void preUpdate() { updatedAt = LocalDateTime.now(); }
}
