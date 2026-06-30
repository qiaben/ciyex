package org.ciyex.ehr.controller;

import lombok.RequiredArgsConstructor;
import org.ciyex.ehr.dto.ApiResponse;
import org.ciyex.ehr.service.AppointmentEncounterService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Practice rooms. Returns the configured appointment "room" options (from
 * tab_field_config, org-scoped) as a flat list. Used by the Schedule sidebar
 * room filter and the appointment create/edit dialogs, which call GET
 * /api/rooms. Mirrors GET /api/appointments/room-options at the path the
 * schedule pane expects; returns an empty list when the org has no room config
 * (the client then falls back to its default room names).
 */
@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final AppointmentEncounterService appointmentEncounterService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<String>>> list() {
        return ResponseEntity.ok(ApiResponse.ok("Rooms", appointmentEncounterService.getRoomOptions()));
    }
}
