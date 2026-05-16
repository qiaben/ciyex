package org.ciyex.ehr.controller.portal;

import org.ciyex.ehr.dto.portal.ApiResponse;
import org.ciyex.ehr.portal.entity.DocumentReview;
import org.ciyex.ehr.portal.entity.PortalNotification;
import org.ciyex.ehr.portal.repository.DocumentReviewRepository;
import org.ciyex.ehr.portal.repository.PortalNotificationRepository;
import org.ciyex.ehr.service.DocumentService;
import org.ciyex.ehr.service.DocumentService.DownloadResult;
import org.ciyex.ehr.service.PracticeContextService;
import org.ciyex.ehr.service.portal.PortalNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hl7.fhir.r4.model.Enumerations;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Controller for EHR staff to review patient-uploaded documents.
 */
@RestController
@RequestMapping("/api/portal/document-reviews")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(
    origins = { "http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001" },
    allowedHeaders = "*",
    methods = { RequestMethod.GET, RequestMethod.PUT, RequestMethod.OPTIONS },
    allowCredentials = "true"
)
public class PortalDocumentReviewController {

    private final DocumentReviewRepository reviewRepo;
    private final PortalNotificationRepository notificationRepo;
    private final DocumentService documentService;
    private final PracticeContextService practiceContextService;
    private final PortalNotificationService portalNotificationService;

    /**
     * GET /api/portal/document-reviews
     * List all patient-uploaded documents for the current org. Optional ?status=PENDING|ACCEPTED|REJECTED.
     * Used by the Ciyex Workspace Document Reviews editor, which fetches at the collection root.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<DocumentReview>>> listDocuments(
            @RequestParam(value = "status", required = false) String status) {
        String orgAlias = practiceContextService.getPracticeId();
        if (orgAlias == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("No organization context"));
        }

        List<DocumentReview> docs = (status != null && !status.isBlank())
                ? reviewRepo.findByOrgAliasAndStatusOrderByCreatedAtDesc(orgAlias, status.toUpperCase())
                : reviewRepo.findByOrgAliasOrderByCreatedAtDesc(orgAlias);
        return ResponseEntity.ok(ApiResponse.success("Document reviews retrieved", docs));
    }

    /**
     * GET /api/portal/document-reviews/pending
     * List all pending patient-uploaded documents for the current org.
     */
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<DocumentReview>>> getPendingDocuments() {
        String orgAlias = practiceContextService.getPracticeId();
        if (orgAlias == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("No organization context"));
        }

        List<DocumentReview> pending = reviewRepo.findByOrgAliasAndStatusOrderByCreatedAtDesc(orgAlias, "PENDING");
        return ResponseEntity.ok(ApiResponse.success("Pending documents retrieved", pending));
    }

    /**
     * PUT /api/portal/document-reviews/{id}/accept
     * Accept a document — it stays in the patient's records.
     */
    @PutMapping("/{id}/accept")
    public ResponseEntity<ApiResponse<DocumentReview>> acceptDocument(
            @PathVariable Long id, Authentication authentication) {
        String orgAlias = practiceContextService.getPracticeId();
        if (orgAlias == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("No organization context"));
        }

        var opt = reviewRepo.findByIdAndOrgAlias(id, orgAlias);
        if (opt.isEmpty()) {
            return ResponseEntity.status(404).body(ApiResponse.error("Document review not found"));
        }

        DocumentReview review = opt.get();
        if (!"PENDING".equals(review.getStatus())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Document already reviewed"));
        }

        review.setStatus("ACCEPTED");
        review.setReviewedAt(LocalDateTime.now());
        review.setReviewerEmail(extractEmail(authentication));
        reviewRepo.save(review);

        // Make the FHIR DocumentReference visible (CURRENT) in the patient chart
        try {
            documentService.updateStatus(review.getFhirId(), Enumerations.DocumentReferenceStatus.CURRENT);
        } catch (Exception e) {
            log.warn("Could not update FHIR status for {}: {}", review.getFhirId(), e.getMessage());
        }

        // Notify patient
        createPatientNotification(review, "document_accepted",
                "Document Accepted",
                "Your document \"" + review.getFileName() + "\" has been accepted and added to your records.",
                null);

        log.info("Document review {} accepted by {}", id, review.getReviewerEmail());
        return ResponseEntity.ok(ApiResponse.success("Document accepted", review));
    }

    /**
     * PUT /api/portal/document-reviews/{id}/reject?reason=...
     * Reject a document and notify the patient with the reason.
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<DocumentReview>> rejectDocument(
            @PathVariable Long id,
            @RequestParam(defaultValue = "No reason provided") String reason,
            Authentication authentication) {
        String orgAlias = practiceContextService.getPracticeId();
        if (orgAlias == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("No organization context"));
        }

        var opt = reviewRepo.findByIdAndOrgAlias(id, orgAlias);
        if (opt.isEmpty()) {
            return ResponseEntity.status(404).body(ApiResponse.error("Document review not found"));
        }

        DocumentReview review = opt.get();
        if (!"PENDING".equals(review.getStatus())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Document already reviewed"));
        }

        review.setStatus("REJECTED");
        review.setRejectionReason(reason);
        review.setReviewedAt(LocalDateTime.now());
        review.setReviewerEmail(extractEmail(authentication));
        reviewRepo.save(review);

        // Delete the FHIR DocumentReference + storage file (rejected = not needed)
        try {
            documentService.delete(review.getFhirId());
        } catch (Exception e) {
            log.warn("Could not delete FHIR doc for rejected review {}: {}", id, e.getMessage());
        }

        // Notify patient
        createPatientNotification(review, "document_rejected",
                "Document Rejected",
                "Your document \"" + review.getFileName() + "\" was rejected.",
                reason);

        log.info("Document review {} rejected by {} — reason: {}", id, review.getReviewerEmail(), reason);
        return ResponseEntity.ok(ApiResponse.success("Document rejected", review));
    }

    /**
     * GET /api/portal/document-reviews/{id}/preview
     * Download the document file for preview.
     */
    @GetMapping("/{id}/preview")
    public ResponseEntity<?> previewDocument(@PathVariable Long id) {
        String orgAlias = practiceContextService.getPracticeId();
        if (orgAlias == null) {
            return ResponseEntity.badRequest().build();
        }

        var opt = reviewRepo.findByIdAndOrgAlias(id, orgAlias);
        if (opt.isEmpty()) {
            return ResponseEntity.status(404).build();
        }

        try {
            DownloadResult result = documentService.download(opt.get().getFhirId());
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(result.getContentType()))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + result.getFileName() + "\"")
                    .body(new InputStreamResource(result.getInputStream()));
        } catch (Exception e) {
            log.error("Preview failed for document review {}: {}", id, e.getMessage());
            return ResponseEntity.status(404).body(ApiResponse.error("Document not found or unavailable"));
        }
    }

    // ---- Helpers ----

    private void createPatientNotification(DocumentReview review, String type, String title,
                                           String message, String reason) {
        try {
            PortalNotification notif = PortalNotification.builder()
                    .patientId(review.getPatientId())
                    .patientEmail(review.getPatientEmail())
                    .type(type)
                    .title(title)
                    .message(message)
                    .reason(reason)
                    .orgAlias(review.getOrgAlias())
                    .build();
            notificationRepo.save(notif);
        } catch (Exception e) {
            log.error("Failed to create patient notification for review {}: {}", review.getId(), e.getMessage());
        }
    }

    private String extractEmail(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            String email = jwt.getClaimAsString("email");
            if (email != null && !email.isBlank()) return email;
            String preferred = jwt.getClaimAsString("preferred_username");
            if (preferred != null && !preferred.isBlank()) return preferred;
        }
        return authentication != null ? authentication.getName() : "unknown";
    }
}
