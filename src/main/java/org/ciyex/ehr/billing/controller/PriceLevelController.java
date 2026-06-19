package org.ciyex.ehr.billing.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ciyex.ehr.billing.dto.PriceLevelDto;
import org.ciyex.ehr.billing.service.PriceLevelService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

/**
 * Price Level CRUD. NOTE: the list endpoint returns a BARE JSON array (not the
 * usual ApiResponse envelope) because the Price Level settings grid and the Fee
 * Sheet editor both consume it as a top-level array.
 */
@RestController
@RequestMapping("/api/price-levels")
@RequiredArgsConstructor
@Slf4j
public class PriceLevelController {

    private final PriceLevelService service;

    @GetMapping
    public ResponseEntity<List<PriceLevelDto>> list() {
        return ResponseEntity.ok(service.getAll());
    }

    @PostMapping
    public ResponseEntity<PriceLevelDto> create(@RequestBody PriceLevelDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PriceLevelDto> update(@PathVariable Long id, @RequestBody PriceLevelDto dto) {
        try {
            return ResponseEntity.ok(service.update(id, dto));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            service.delete(id);
            return ResponseEntity.ok().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).build();
        }
    }
}
