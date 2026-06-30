package org.ciyex.ehr.waitlist.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class WaitlistDto {
    private Long id;
    private String patientId;
    private String patientName;
    private String requestedType;
    private String requestedDate;
    private Integer priority;
    private String status;
    private String notes;
    private String createdAt;
    private String updatedAt;
}
