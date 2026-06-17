package org.ciyex.ehr.portal.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ciyex.ehr.dto.ApiResponse;
import org.ciyex.ehr.dto.integration.RequestContext;
import org.ciyex.ehr.portal.entity.PortalFormSubmission;
import org.ciyex.ehr.portal.service.PortalFormSubmissionService;
import org.ciyex.ehr.service.portal.PortalGenericResourceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portal/form-submissions")
@RequiredArgsConstructor
@Slf4j
public class PortalFormSubmissionController {

    private final PortalFormSubmissionService submissionService;
    private final PortalGenericResourceService portalResourceService;

    private String orgAlias() {
        return RequestContext.get().getOrgName();
    }

    private String extractEmail(Authentication auth) {
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            return jwt.getClaimAsString("email");
        }
        return null;
    }

    private String extractName(Authentication auth) {
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            return jwt.getClaimAsString("name");
        }
        return null;
    }

    /**
     * Patient submits a form from the portal.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<PortalFormSubmission>> submit(
            Authentication auth,
            @RequestBody PortalFormSubmission submission) {
        try {
            String email = extractEmail(auth);
            if (email == null) return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid token"));

            String patientId = portalResourceService.resolvePatientId(email);
            submission.setPatientId(patientId);
            submission.setPatientName(extractName(auth));

            var saved = submissionService.submit(orgAlias(), submission);
            return ResponseEntity.ok(ApiResponse.ok("Form submitted successfully", saved));
        } catch (Exception e) {
            log.error("Failed to submit form", e);
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed: " + e.getMessage()));
        }
    }

    /**
     * Patient views their own submissions.
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<PortalFormSubmission>>> mySubmissions(Authentication auth) {
        try {
            String email = extractEmail(auth);
            if (email == null) return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid token"));

            String patientId = portalResourceService.resolvePatientId(email);
            var subs = submissionService.getMySubmissions(orgAlias(), patientId);
            return ResponseEntity.ok(ApiResponse.ok("Submissions retrieved", subs));
        } catch (Exception e) {
            log.error("Failed to get my submissions", e);
            return ResponseEntity.ok(ApiResponse.error("Failed: " + e.getMessage()));
        }
    }

    /**
     * Staff: list all submissions (optionally filtered by status).
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<PortalFormSubmission>>> listAll(
            @RequestParam(required = false) String status) {
        try {
            var subs = (status != null && !status.isBlank())
                    ? submissionService.getByStatus(orgAlias(), status)
                    : submissionService.getAll(orgAlias());
            return ResponseEntity.ok(ApiResponse.ok("Submissions retrieved", subs));
        } catch (Exception e) {
            log.error("Failed to list submissions", e);
            return ResponseEntity.ok(ApiResponse.error("Failed: " + e.getMessage()));
        }
    }

    /**
     * Staff: list pending submissions.
     */
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<PortalFormSubmission>>> listPending() {
        try {
            var subs = submissionService.getPending(orgAlias());
            return ResponseEntity.ok(ApiResponse.ok("Pending submissions retrieved", subs));
        } catch (Exception e) {
            log.error("Failed to list pending submissions", e);
            return ResponseEntity.ok(ApiResponse.error("Failed: " + e.getMessage()));
        }
    }

    /**
     * Staff: list submissions for a specific patient.
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<PortalFormSubmission>>> listByPatient(
            @PathVariable String patientId) {
        try {
            var subs = submissionService.getByPatient(orgAlias(), patientId);
            return ResponseEntity.ok(ApiResponse.ok("Patient submissions retrieved", subs));
        } catch (Exception e) {
            log.error("Failed to list patient submissions patientId={}", patientId, e);
            return ResponseEntity.ok(ApiResponse.error("Failed: " + e.getMessage()));
        }
    }

    /**
     * Staff: accept a submission.
     */
    @PutMapping("/{id}/accept")
    public ResponseEntity<ApiResponse<PortalFormSubmission>> accept(
            @PathVariable Long id,
            Authentication auth) {
        try {
            String reviewer = extractName(auth);
            var sub = submissionService.accept(orgAlias(), id, reviewer);
            return ResponseEntity.ok(ApiResponse.ok("Submission accepted", sub));
        } catch (Exception e) {
            log.error("Failed to accept submission id={}", id, e);
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed: " + e.getMessage()));
        }
    }

    /**
     * Staff: reject a submission (kept with status "rejected", not deleted).
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<String>> reject(
            @PathVariable Long id,
            @RequestParam(required = false) String reason,
            Authentication auth) {
        try {
            String reviewer = extractName(auth);
            submissionService.reject(orgAlias(), id, reviewer, reason);
            return ResponseEntity.ok(ApiResponse.ok("Submission rejected", "ok"));
        } catch (Exception e) {
            log.error("Failed to reject submission id={}", id, e);
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed: " + e.getMessage()));
        }
    }
}
