/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Ciyex Inc. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
package org.ciyex.ehr.licensing.controller;

import org.ciyex.ehr.licensing.entity.ExtensionLicense;
import org.ciyex.ehr.licensing.repository.ExtensionLicenseRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/licensing")
public class LicensingController {

    private final ExtensionLicenseRepository licenseRepo;

    public LicensingController(ExtensionLicenseRepository licenseRepo) {
        this.licenseRepo = licenseRepo;
    }

    /**
     * Check license status for an extension.
     * Called by @ciyex/extension-sdk on extension activation.
     */
    @GetMapping("/{extensionId}")
    public ResponseEntity<Map<String, Object>> checkLicense(
            @PathVariable String extensionId,
            @RequestHeader(value = "X-Tenant-Name", required = false, defaultValue = "") String orgAlias) {

        if (orgAlias.isEmpty()) {
            return ResponseEntity.ok(Map.of("status", "none"));
        }

        var license = licenseRepo.findByOrgAliasAndExtensionId(orgAlias, extensionId);

        if (license.isEmpty()) {
            return ResponseEntity.ok(Map.of("status", "none"));
        }

        var lic = license.get();
        var now = Instant.now();

        // Check if trial expired
        if ("trial".equals(lic.getStatus()) && lic.getTrialEndsAt() != null && now.isAfter(lic.getTrialEndsAt())) {
            lic.setStatus("expired");
            licenseRepo.save(lic);
            return ResponseEntity.ok(Map.of("status", "expired", "trialEndsAt", lic.getTrialEndsAt().toString()));
        }

        // Check if subscription period expired
        if ("active".equals(lic.getStatus()) && lic.getCurrentPeriodEnd() != null && now.isAfter(lic.getCurrentPeriodEnd())) {
            lic.setStatus("expired");
            licenseRepo.save(lic);
            return ResponseEntity.ok(Map.of("status", "expired", "currentPeriodEnd", lic.getCurrentPeriodEnd().toString()));
        }

        return ResponseEntity.ok(Map.of(
                "status", lic.getStatus(),
                "plan", lic.getPlanId() != null ? lic.getPlanId() : "",
                "features", List.of("*"),
                "currentPeriodEnd", lic.getCurrentPeriodEnd() != null ? lic.getCurrentPeriodEnd().toString() : "",
                "trialEndsAt", lic.getTrialEndsAt() != null ? lic.getTrialEndsAt().toString() : ""
        ));
    }

    /**
     * Create a Stripe Checkout Session for an extension subscription.
     * Returns a checkout URL that the extension opens in the browser.
     */
    @PostMapping("/{extensionId}/checkout")
    public ResponseEntity<Map<String, Object>> createCheckout(
            @PathVariable String extensionId,
            @RequestHeader(value = "X-Tenant-Name", required = false, defaultValue = "") String orgAlias,
            @RequestBody Map<String, String> body) {

        // TODO: Integrate with Stripe API to create checkout session
        // For now, return a placeholder
        var planId = body.getOrDefault("planId", "basic");

        return ResponseEntity.ok(Map.of(
                "checkoutUrl", "https://checkout.stripe.com/placeholder?ext=" + extensionId + "&plan=" + planId + "&org=" + orgAlias
        ));
    }

    /**
     * List all licenses for the current org.
     */
    @GetMapping
    public ResponseEntity<List<ExtensionLicense>> listLicenses(
            @RequestHeader(value = "X-Tenant-Name", required = false, defaultValue = "") String orgAlias) {

        if (orgAlias.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(licenseRepo.findByOrgAlias(orgAlias));
    }

    /**
     * Report usage for metering-based extensions.
     */
    @PostMapping("/{extensionId}/usage")
    public ResponseEntity<Map<String, Object>> reportUsage(
            @PathVariable String extensionId,
            @RequestHeader(value = "X-Tenant-Name", required = false, defaultValue = "") String orgAlias,
            @RequestBody Map<String, Object> body) {

        // TODO: Insert into extension_usage table
        return ResponseEntity.ok(Map.of("recorded", true));
    }

    /**
     * Stripe webhook handler — creates/updates licenses on payment events.
     */
    @PostMapping("/webhook/stripe")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String signature) {

        // TODO: Verify signature and process events:
        // - checkout.session.completed → create license
        // - invoice.paid → extend currentPeriodEnd
        // - customer.subscription.deleted → set status=cancelled
        // - customer.subscription.updated → update plan/period

        return ResponseEntity.ok("ok");
    }
}
