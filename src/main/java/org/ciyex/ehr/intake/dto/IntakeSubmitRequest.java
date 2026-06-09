package org.ciyex.ehr.intake.dto;

import lombok.Data;

import java.util.HashMap;
import java.util.Map;

/** Patient-submitted intake answers, keyed by field name. */
@Data
public class IntakeSubmitRequest {
    private Map<String, Object> responses = new HashMap<>();
}
