package org.ciyex.ehr.payment.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Entity @Table(name = "payment_transaction")
@Builder @NoArgsConstructor @AllArgsConstructor
public class PaymentTransaction {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long patientId;
    private String patientName;
    private Long paymentMethodId;
    private BigDecimal amount;
    private String currency;            // USD
    private String status;              // pending, processing, completed, failed, refunded, partial_refund, voided
    private String transactionType;     // payment, refund, adjustment, write_off
    private String paymentMethodType;   // credit_card, debit_card, bank_account, fsa, hsa, cash, check
    private String cardBrand;
    private String lastFour;
    private String description;
    private String referenceType;       // encounter, claim, invoice, copay, balance
    private Long referenceId;
    private String invoiceNumber;
    private String stripePaymentIntentId;
    private String stripeChargeId;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSONB")
    private String processorResponse;
    private BigDecimal convenienceFee;
    private BigDecimal refundAmount;
    @Column(columnDefinition = "TEXT")
    private String refundReason;
    private Boolean receiptSent;
    private String receiptEmail;
    private String collectedBy;
    private LocalDateTime collectedAt;
    @Column(columnDefinition = "TEXT")
    private String notes;

    // Posting / allocation & adjustment detail captured on the Post/Edit Payment
    // form. These previously had no columns, so everything in the form's
    // "Allocation & Adjustments" section (plus payer / claim / date of service)
    // was silently dropped on save and came back blank on edit.
    private LocalDate dateOfService;
    private String payerName;
    private String claimId;
    private BigDecimal allowedAmount;
    private BigDecimal paidAmount;
    private BigDecimal adjustmentAmount;
    private String adjustmentReason;
    private BigDecimal patientResponsibility;
    private BigDecimal remainingBalance;
    private String eraReference;

    private String orgAlias;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        createdAt = updatedAt = LocalDateTime.now();
        if (currency == null) currency = "USD";
        if (status == null) status = "pending";
        if (transactionType == null) transactionType = "payment";
        if (processorResponse == null) processorResponse = "{}";
        if (convenienceFee == null) convenienceFee = BigDecimal.ZERO;
        if (refundAmount == null) refundAmount = BigDecimal.ZERO;
        if (receiptSent == null) receiptSent = false;
    }

    @PreUpdate
    void preUpdate() { updatedAt = LocalDateTime.now(); }
}
