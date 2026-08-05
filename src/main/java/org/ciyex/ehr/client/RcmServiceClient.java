package org.ciyex.ehr.client;

import lombok.extern.slf4j.Slf4j;
import org.ciyex.ehr.dto.integration.RequestContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * Tells ciyex-rcm about money the practice has taken from a patient.
 *
 * <p>RCM already writes its insurance payments back here, so the EHR ledger shows the
 * whole picture and the front desk collects from one balance. Nothing went the other
 * way: a patient could pay their share at the desk and RCM would never hear of it,
 * still showing the full amount outstanding — and a statement generated from RCM would
 * bill them again for money they had already handed over.
 *
 * <p>Only patient payments are forwarded. An insurance payment arriving here came
 * <em>from</em> RCM in the first place, so sending it back would post it twice and
 * loop the two services against each other.
 *
 * <p>Unconfigured (no {@code services.rcm-url}) the client quietly does nothing, which
 * is what a practice without the RCM subscription wants.
 */
@Component
@Slf4j
public class RcmServiceClient {

    private final RestClient restClient;

    public RcmServiceClient(@Value("${services.rcm-url:}") String rcmUrl,
                            RestClient.Builder restClientBuilder) {
        String base = rcmUrl != null ? rcmUrl.trim() : "";
        this.restClient = base.isEmpty() ? null : restClientBuilder.baseUrl(base).build();
    }

    public boolean isConfigured() {
        return restClient != null;
    }

    /**
     * Record a payment the patient made against their balance.
     *
     * <p>Never throws: the money is already recorded here, and a missing copy in RCM is
     * recoverable where a lost payment is not.
     *
     * @return true when RCM accepted it
     */
    public boolean recordPatientPayment(String patientId, String patientName, BigDecimal amount,
                                        String paymentMethod, String referenceNumber, String claimNumber) {
        if (!isConfigured() || patientId == null || patientId.isBlank()) {
            return false;
        }
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return false;
        }

        Map<String, Object> body = new HashMap<>();
        body.put("amount", amount);
        body.put("patientName", patientName != null ? patientName : "");
        body.put("paymentMethod", paymentMethod != null ? paymentMethod.toUpperCase() : "CASH");
        if (referenceNumber != null && !referenceNumber.isBlank()) {
            body.put("referenceNumber", referenceNumber);
        }
        if (claimNumber != null && !claimNumber.isBlank()) {
            body.put("claimNumber", claimNumber);
        }

        try {
            restClient.post()
                    .uri("/api/rcm/patient-ledger/{patientId}/payment", patientId)
                    .headers(this::applyCallerIdentity)
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
            log.info("Told RCM about a patient payment of {} for patient {}", amount, patientId);
            return true;
        } catch (Exception e) {
            log.warn("Could not tell RCM about the patient payment for patient {}: {}", patientId, e.getMessage());
            return false;
        }
    }

    private void applyCallerIdentity(HttpHeaders headers) {
        RequestContext ctx = RequestContext.get();
        if (ctx.getAuthToken() != null && !ctx.getAuthToken().isBlank()) {
            headers.set(HttpHeaders.AUTHORIZATION, ctx.getAuthToken());
        }
        if (ctx.getOrgName() != null && !ctx.getOrgName().isBlank()) {
            headers.set("X-Org-Alias", ctx.getOrgName());
        }
    }
}
