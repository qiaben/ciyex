package org.ciyex.ehr.intake.dto;

import lombok.Data;

/** Patient-entered one-time code for the intake OTP gate. */
@Data
public class IntakeOtpVerifyRequest {
    private String code;
}
