package org.ciyex.ehr.intake.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

/** What the public intake page receives when it validates a token. */
@Data
@Builder
public class IntakePublicView {
    /** open | submitted */
    private String status;
    private String practiceName;
    private Map<String, Object> prefill;
}
