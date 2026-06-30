package org.ciyex.ehr.waitlist.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ciyex.ehr.dto.ApiResponse;
import org.ciyex.ehr.waitlist.dto.WaitlistDto;
import org.ciyex.ehr.waitlist.service.WaitlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

/**
 * Scheduling waitlist. Backs the Schedule sidebar "Waitlist" panel (GET) and the
 * calendar "Add to Waitlist" quick action (POST). Responses are wrapped in
 * {@link ApiResponse} so the client reads the rows from {@code data} (it looks
 * for {@code data.content} or a {@code data} array). The list endpoint ignores
 * the client's {@code page}/{@code size} query params (the panel shows the full
 * org waitlist).
 */
@RestController
@RequestMapping("/api/waitlist")
@RequiredArgsConstructor
@Slf4j
public class WaitlistController {

    private final WaitlistService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<WaitlistDto>>> list() {
        return ResponseEntity.ok(ApiResponse.ok("Waitlist", service.getAll()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WaitlistDto>> create(@RequestBody WaitlistDto dto) {
        return ResponseEntity.ok(ApiResponse.ok("Added to waitlist", service.create(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<WaitlistDto>> update(@PathVariable Long id, @RequestBody WaitlistDto dto) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Waitlist updated", service.update(id, dto)));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        try {
            service.delete(id);
            return ResponseEntity.ok(ApiResponse.ok("Removed from waitlist", null));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(ApiResponse.error(e.getMessage()));
        }
    }
}
