package com.qiaben.ciyex.controller;

import com.qiaben.ciyex.dto.ApiResponse;
import com.qiaben.ciyex.entity.PaymentTransaction;
import com.qiaben.ciyex.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentsController {

    private final PaymentTransactionRepository repo;

    // ------------------------------------------------------------------
    // POST /api/payments/collect  — record a new payment transaction
    // ------------------------------------------------------------------
    @PostMapping("/collect")
    public ResponseEntity<ApiResponse<PaymentTransaction>> collect(
            @RequestHeader(value = "X-Org-Alias", required = false) String orgAlias,
            @RequestBody Map<String, Object> body) {
        try {
            PaymentTransaction tx = fromBody(body);
            tx.setOrgAlias(orgAlias);
            if (tx.getCollectedAt() == null) {
                tx.setCollectedAt(LocalDateTime.now());
            }
            PaymentTransaction saved = repo.save(tx);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.<PaymentTransaction>builder()
                            .success(true)
                            .message("Payment recorded successfully")
                            .data(saved)
                            .build());
        } catch (Exception e) {
            log.error("Failed to collect payment", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<PaymentTransaction>builder()
                            .success(false)
                            .message("Failed to record payment: " + e.getMessage())
                            .build());
        }
    }

    // ------------------------------------------------------------------
    // GET /api/payments/transactions  — list all transactions for the org
    // ------------------------------------------------------------------
    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<List<PaymentTransaction>>> list(
            @RequestHeader(value = "X-Org-Alias", required = false) String orgAlias,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        try {
            List<PaymentTransaction> txs = (orgAlias != null && !orgAlias.isBlank())
                    ? repo.findByOrgAliasOrderByCreatedAtDesc(orgAlias, PageRequest.of(page, size)).getContent()
                    : repo.findAll(PageRequest.of(page, size)).getContent();
            return ResponseEntity.ok(ApiResponse.<List<PaymentTransaction>>builder()
                    .success(true)
                    .message("Transactions retrieved")
                    .data(txs)
                    .build());
        } catch (Exception e) {
            log.error("Failed to list transactions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<List<PaymentTransaction>>builder()
                            .success(false)
                            .message("Failed to retrieve transactions: " + e.getMessage())
                            .build());
        }
    }

    // ------------------------------------------------------------------
    // GET /api/payments/transactions/{id}
    // ------------------------------------------------------------------
    @GetMapping("/transactions/{id}")
    public ResponseEntity<ApiResponse<PaymentTransaction>> getOne(
            @RequestHeader(value = "X-Org-Alias", required = false) String orgAlias,
            @PathVariable Long id) {
        Optional<PaymentTransaction> opt = (orgAlias != null && !orgAlias.isBlank())
                ? repo.findByIdAndOrgAlias(id, orgAlias)
                : repo.findById(id);
        return opt.map(tx -> ResponseEntity.ok(ApiResponse.<PaymentTransaction>builder()
                        .success(true).message("OK").data(tx).build()))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.<PaymentTransaction>builder()
                                .success(false).message("Transaction not found").build()));
    }

    // ------------------------------------------------------------------
    // PUT /api/payments/transactions/{id}  — update
    // ------------------------------------------------------------------
    @PutMapping("/transactions/{id}")
    public ResponseEntity<ApiResponse<PaymentTransaction>> update(
            @RequestHeader(value = "X-Org-Alias", required = false) String orgAlias,
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        try {
            Optional<PaymentTransaction> opt = (orgAlias != null && !orgAlias.isBlank())
                    ? repo.findByIdAndOrgAlias(id, orgAlias)
                    : repo.findById(id);
            if (opt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.<PaymentTransaction>builder()
                                .success(false).message("Transaction not found").build());
            }
            PaymentTransaction tx = opt.get();
            applyBody(tx, body);
            PaymentTransaction saved = repo.save(tx);
            return ResponseEntity.ok(ApiResponse.<PaymentTransaction>builder()
                    .success(true).message("Updated").data(saved).build());
        } catch (Exception e) {
            log.error("Failed to update transaction {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<PaymentTransaction>builder()
                            .success(false).message("Failed to update: " + e.getMessage()).build());
        }
    }

    // ------------------------------------------------------------------
    // DELETE /api/payments/transactions/{id}
    // ------------------------------------------------------------------
    @DeleteMapping("/transactions/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @RequestHeader(value = "X-Org-Alias", required = false) String orgAlias,
            @PathVariable Long id) {
        try {
            Optional<PaymentTransaction> opt = (orgAlias != null && !orgAlias.isBlank())
                    ? repo.findByIdAndOrgAlias(id, orgAlias)
                    : repo.findById(id);
            if (opt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.<Void>builder().success(false).message("Not found").build());
            }
            repo.delete(opt.get());
            return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Deleted").build());
        } catch (Exception e) {
            log.error("Failed to delete transaction {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<Void>builder().success(false).message("Failed: " + e.getMessage()).build());
        }
    }

    // ------------------------------------------------------------------
    // POST /api/payments/transactions/{id}/refund
    // ------------------------------------------------------------------
    @PostMapping("/transactions/{id}/refund")
    public ResponseEntity<ApiResponse<PaymentTransaction>> refund(
            @RequestHeader(value = "X-Org-Alias", required = false) String orgAlias,
            @PathVariable Long id) {
        return changeStatus(orgAlias, id, "refunded", "Refunded");
    }

    // ------------------------------------------------------------------
    // POST /api/payments/transactions/{id}/void
    // ------------------------------------------------------------------
    @PostMapping("/transactions/{id}/void")
    public ResponseEntity<ApiResponse<PaymentTransaction>> voidTx(
            @RequestHeader(value = "X-Org-Alias", required = false) String orgAlias,
            @PathVariable Long id) {
        return changeStatus(orgAlias, id, "voided", "Voided");
    }

    // ------------------------------------------------------------------
    // GET /api/payments/stats
    // ------------------------------------------------------------------
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> stats(
            @RequestHeader(value = "X-Org-Alias", required = false) String orgAlias) {
        try {
            String org = (orgAlias != null && !orgAlias.isBlank()) ? orgAlias : "";
            Map<String, Object> stats = new HashMap<>();
            stats.put("pendingCount",   repo.countByOrgAliasAndStatus(org, "pending"));
            stats.put("completedCount", repo.countByOrgAliasAndStatus(org, "completed"));
            stats.put("failedCount",    repo.countByOrgAliasAndStatus(org, "failed"));
            stats.put("refundedCount",  repo.countByOrgAliasAndStatus(org, "refunded"));
            stats.put("totalCollected", repo.sumCompletedByOrgAlias(org));
            stats.put("totalRefunded",  repo.sumRefundedByOrgAlias(org));
            return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                    .success(true).message("Stats retrieved").data(stats).build());
        } catch (Exception e) {
            log.error("Failed to retrieve payment stats", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<Map<String, Object>>builder()
                            .success(false).message("Failed: " + e.getMessage()).build());
        }
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private ResponseEntity<ApiResponse<PaymentTransaction>> changeStatus(
            String orgAlias, Long id, String newStatus, String label) {
        try {
            Optional<PaymentTransaction> opt = (orgAlias != null && !orgAlias.isBlank())
                    ? repo.findByIdAndOrgAlias(id, orgAlias)
                    : repo.findById(id);
            if (opt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.<PaymentTransaction>builder()
                                .success(false).message("Transaction not found").build());
            }
            PaymentTransaction tx = opt.get();
            tx.setStatus(newStatus);
            PaymentTransaction saved = repo.save(tx);
            return ResponseEntity.ok(ApiResponse.<PaymentTransaction>builder()
                    .success(true).message(label).data(saved).build());
        } catch (Exception e) {
            log.error("Failed to {} transaction {}", label, id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<PaymentTransaction>builder()
                            .success(false).message("Failed: " + e.getMessage()).build());
        }
    }

    private PaymentTransaction fromBody(Map<String, Object> body) {
        PaymentTransaction tx = new PaymentTransaction();
        applyBody(tx, body);
        return tx;
    }

    private void applyBody(PaymentTransaction tx, Map<String, Object> body) {
        if (body.containsKey("patientId"))        tx.setPatientId(str(body.get("patientId")));
        if (body.containsKey("patientName"))      tx.setPatientName(str(body.get("patientName")));
        if (body.containsKey("amount"))           tx.setAmount(decimal(body.get("amount")));
        if (body.containsKey("transactionType"))  tx.setTransactionType(str(body.get("transactionType")));
        if (body.containsKey("paymentMethodType"))tx.setPaymentMethodType(str(body.get("paymentMethodType")));
        if (body.containsKey("description"))      tx.setDescription(str(body.get("description")));
        if (body.containsKey("invoiceId"))        tx.setInvoiceId(str(body.get("invoiceId")));
        if (body.containsKey("transactionId"))    tx.setTransactionId(str(body.get("transactionId")));
        if (body.containsKey("status"))           tx.setStatus(str(body.get("status")));
        if (body.containsKey("collectedAt") && body.get("collectedAt") != null) {
            try { tx.setCollectedAt(LocalDateTime.parse(str(body.get("collectedAt")))); } catch (Exception ignored) { }
        }
    }

    private static String str(Object v) {
        return v == null ? null : v.toString().trim().isEmpty() ? null : v.toString().trim();
    }

    private static BigDecimal decimal(Object v) {
        if (v == null) { return BigDecimal.ZERO; }
        try { return new BigDecimal(v.toString()); } catch (Exception e) { return BigDecimal.ZERO; }
    }
}
