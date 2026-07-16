package org.ciyex.ehr.intake.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ciyex.ehr.dto.ApiResponse;
import org.ciyex.ehr.dto.integration.RequestContext;
import org.ciyex.ehr.intake.dto.IntakeOtpVerifyRequest;
import org.ciyex.ehr.intake.dto.IntakePublicView;
import org.ciyex.ehr.intake.dto.IntakeSendRequest;
import org.ciyex.ehr.intake.dto.IntakeSubmitRequest;
import org.ciyex.ehr.intake.service.IntakeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Patient intake endpoints.
 *
 * {@code /api/intake/send} is staff-only (authenticated). The
 * {@code /api/intake/public/**} routes are reachable without a login — the
 * token in the path carries the owning org — and are whitelisted in
 * SecurityConfig.
 */
@RestController
@RequestMapping("/api/intake")
@RequiredArgsConstructor
@Slf4j
public class IntakeController {

    private final IntakeService intakeService;

    /** Staff: mint a token, send the link by SMS/email, return the link. */
    @PostMapping("/send")
    public ResponseEntity<ApiResponse<Map<String, Object>>> send(@RequestBody IntakeSendRequest req) {
        try {
            String orgAlias = RequestContext.get().getOrgName();
            Map<String, Object> result = intakeService.send(orgAlias, req);
            return ResponseEntity.ok(ApiResponse.ok("Intake form sent", result));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to send intake form", e);
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed: " + e.getMessage()));
        }
    }

    /** Public: validate the token and return any prefill for the form page. */
    @GetMapping("/public/{token}")
    public ResponseEntity<ApiResponse<IntakePublicView>> getPublic(@PathVariable String token) {
        IntakePublicView view = intakeService.getPublic(token);
        return ResponseEntity.ok(ApiResponse.ok("Intake form", view));
    }

    /** Public: send (or resend) the OTP to the channel the link was sent to. */
    @PostMapping("/public/{token}/otp/send")
    public ResponseEntity<ApiResponse<IntakePublicView>> sendOtp(@PathVariable String token) {
        IntakePublicView view = intakeService.sendOtp(token);
        return ResponseEntity.ok(ApiResponse.ok("Verification code sent", view));
    }

    /** Public: verify the entered code; returns a verification token + prefill on success. */
    @PostMapping("/public/{token}/otp/verify")
    public ResponseEntity<ApiResponse<IntakePublicView>> verifyOtp(
            @PathVariable String token,
            @RequestBody IntakeOtpVerifyRequest req) {
        IntakePublicView view = intakeService.verifyOtp(token, req.getCode());
        return ResponseEntity.ok(ApiResponse.ok("Verified", view));
    }

    /** Public: save the patient's answers (and create the patient if new). Requires OTP verification. */
    @PostMapping("/public/{token}/submit")
    public ResponseEntity<ApiResponse<String>> submit(
            @PathVariable String token,
            @RequestBody IntakeSubmitRequest req) {
        intakeService.submit(token, req.getResponses(), req.getVerificationToken());
        return ResponseEntity.ok(ApiResponse.ok("Intake form submitted", "ok"));
    }
}
