package org.ciyex.ehr.billing.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ciyex.ehr.billing.dto.FeeSheetDto;
import org.ciyex.ehr.billing.service.FeeSheetService;
import org.ciyex.ehr.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

/**
 * Fee Sheet CRUD + "send to billing". The list endpoint returns a bare JSON
 * array (consumed by the Fee Sheet sidebar and the Encounter Billing dashboard,
 * both of which accept either a bare array or an ApiResponse envelope).
 */
@RestController
@RequestMapping("/api/fee-sheets")
@RequiredArgsConstructor
@Slf4j
public class FeeSheetController {

    private final FeeSheetService service;

    @GetMapping
    public ResponseEntity<List<FeeSheetDto>> list() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/encounter/{encounterId}")
    public ResponseEntity<FeeSheetDto> getByEncounter(@PathVariable String encounterId) {
        return ResponseEntity.ok(service.getByEncounter(encounterId));
    }

    @PostMapping
    public ResponseEntity<FeeSheetDto> create(@RequestBody FeeSheetDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FeeSheetDto> update(@PathVariable Long id, @RequestBody FeeSheetDto dto) {
        try {
            return ResponseEntity.ok(service.update(id, dto));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).build();
        }
    }

    @PostMapping("/{id}/bill")
    public ResponseEntity<ApiResponse<FeeSheetDto>> bill(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        try {
            var billed = service.bill(id, body);
            return ResponseEntity.ok(ApiResponse.ok("Fee sheet sent to billing", billed));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(ApiResponse.error(e.getMessage()));
        }
    }
}
