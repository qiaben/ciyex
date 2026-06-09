package org.ciyex.ehr.intake.dto;

import lombok.Data;

/** Staff request to send an intake form to a patient (existing or new). */
@Data
public class IntakeSendRequest {
    /** Existing patient FHIR id; null/blank when sending to someone not yet in the system. */
    private String patientId;
    private String recipientName;
    /** SMS or EMAIL. */
    private String channel;
    private String phone;
    private String email;
    private String formKey;
}
