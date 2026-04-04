package org.ciyex.ehr.controller.portal;

import org.ciyex.ehr.dto.portal.ApiResponse;
import org.ciyex.ehr.portal.entity.PortalNotification;
import org.ciyex.ehr.portal.repository.PortalNotificationRepository;
import org.ciyex.ehr.service.PracticeContextService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Controller for portal patients to retrieve their notifications
 * (document accepted/rejected, etc.).
 */
@RestController
@RequestMapping("/api/fhir/portal/notifications")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(
    origins = { "http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001" },
    allowedHeaders = "*",
    methods = { RequestMethod.GET, RequestMethod.PUT, RequestMethod.OPTIONS },
    allowCredentials = "true"
)
public class PortalNotificationController {

    private final PortalNotificationRepository notificationRepo;
    private final PracticeContextService practiceContextService;

    /**
     * GET /api/fhir/portal/notifications/my
     * Returns notifications for the authenticated patient.
     */
    @GetMapping("/my")
    @PreAuthorize("hasAuthority('PATIENT') or hasRole('PATIENT') or hasAuthority('SCOPE_patient/Patient.read')")
    public ResponseEntity<ApiResponse<List<PortalNotification>>> getMyNotifications(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }

        String email = extractEmail(authentication);
        String orgAlias = practiceContextService.getPracticeId();
        if (orgAlias == null) {
            return ResponseEntity.ok(ApiResponse.success("No org context", List.of()));
        }

        List<PortalNotification> notifications =
                notificationRepo.findByPatientEmailAndOrgAliasOrderByCreatedAtDesc(email, orgAlias);

        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved", notifications));
    }

    /**
     * PUT /api/fhir/portal/notifications/{id}/read
     * Mark a single notification as read.
     */
    @PutMapping("/{id}/read")
    @PreAuthorize("hasAuthority('PATIENT') or hasRole('PATIENT') or hasAuthority('SCOPE_patient/Patient.read')")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable Long id, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }

        String email = extractEmail(authentication);
        var opt = notificationRepo.findByIdAndPatientEmail(id, email);
        if (opt.isEmpty()) {
            return ResponseEntity.status(404).body(ApiResponse.error("Notification not found"));
        }

        PortalNotification notif = opt.get();
        if (notif.getReadAt() == null) {
            notif.setReadAt(LocalDateTime.now());
            notificationRepo.save(notif);
        }

        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true).message("Marked as read").build());
    }

    private String extractEmail(Authentication authentication) {
        if (authentication.getPrincipal() instanceof Jwt jwt) {
            String email = jwt.getClaimAsString("email");
            if (email != null && !email.isBlank()) return email;
            String preferred = jwt.getClaimAsString("preferred_username");
            if (preferred != null && !preferred.isBlank()) return preferred;
        }
        return authentication.getName();
    }
}
