package org.ciyex.ehr.billing.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class FeeSheetDto {
    private Long id;
    private String encounterId;
    private String patientId;
    private String patientName;
    private String priceLevel;
    private String renderingProvider;
    private String renderingProviderName;
    private String supervisingProvider;
    private BigDecimal total;
    private BigDecimal totalPaid;
    private String billingStatus;
    private String billedMode;
    private String paymentStatus;
    private String comments;
    private List<Map<String, Object>> items;
    private String encounterDate;
    private String createdAt;
    private String updatedAt;
}
