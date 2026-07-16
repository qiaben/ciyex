package org.ciyex.ehr.intake.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

/** What the public intake page receives when it validates a token. */
@Data
@Builder
public class IntakePublicView {
    /** otp_required | open | submitted | expired */
    private String status;
    private String practiceName;
    private Map<String, Object> prefill;

    // OTP gate hints (present when status = otp_required or after a send)
    /** SMS | EMAIL — how the code is delivered. */
    private String channel;
    /** Masked recipient the code is sent to, e.g. "•••• 6886" or "j•••@gmail.com". */
    private String maskedRecipient;
    /** Secret returned on successful verify; the client keeps it for submit. */
    private String verificationToken;
}
