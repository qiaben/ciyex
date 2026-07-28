package org.ciyex.ehr.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ciyex.ehr.dto.ApiResponse;
import org.ciyex.ehr.service.PatientInvoiceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Bulk report data for Financial > CPT Utilization.
 *
 * <p>The report previously read {@code /api/encounters/report/encounterAll}, but
 * FHIR Encounters carry no procedure codes, so its CPT Code and Description
 * columns were always blank. CPT codes live only on invoice line items, so this
 * endpoint flattens every invoice line in the practice into one row per
 * procedure (cptCode, description, providerDisplay, totalAmount, startDate).
 */
@Slf4j
@PreAuthorize("hasAuthority('SCOPE_user/Claim.read')")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reports")
public class CptUtilizationReportController {

    private final PatientInvoiceService invoiceService;

    @GetMapping("/cpt-utilization")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> cptUtilization() {
        List<Map<String, Object>> rows = invoiceService.listAllInvoiceLines();
        return ResponseEntity.ok(ApiResponse.ok("CPT utilization fetched", rows));
    }
}
