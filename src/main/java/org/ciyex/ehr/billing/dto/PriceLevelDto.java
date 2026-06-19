package org.ciyex.ehr.billing.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PriceLevelDto {
    private Long id;
    private String optionId;
    private String title;
    private Integer seq;
    // Explicit JSON name so the boolean serialises as "isDefault" (not "default")
    // to match the Fee Sheet / Price Level frontend contract.
    @JsonProperty("isDefault")
    private Boolean isDefault;
    private Boolean active;
    private String notes;
    private String codes;
    private String createdAt;
    private String updatedAt;
}
