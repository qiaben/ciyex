package org.ciyex.ehr.waitlist.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ciyex.ehr.dto.integration.RequestContext;
import org.ciyex.ehr.waitlist.dto.WaitlistDto;
import org.ciyex.ehr.waitlist.entity.Waitlist;
import org.ciyex.ehr.waitlist.repository.WaitlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Slf4j
public class WaitlistService {

    private final WaitlistRepository repo;

    private String orgAlias() {
        return RequestContext.get().getOrgName();
    }

    @Transactional(readOnly = true)
    public List<WaitlistDto> getAll() {
        return repo.findByOrgAliasOrderByPriorityAscCreatedAtDesc(orgAlias()).stream().map(this::toDto).toList();
    }

    @Transactional
    public WaitlistDto create(WaitlistDto dto) {
        var w = Waitlist.builder()
                .patientId(dto.getPatientId())
                .patientName(dto.getPatientName())
                .requestedType(dto.getRequestedType())
                .requestedDate(dto.getRequestedDate())
                .priority(dto.getPriority() != null ? dto.getPriority() : 1)
                .status(dto.getStatus() != null ? dto.getStatus() : "waiting")
                .notes(dto.getNotes())
                .orgAlias(orgAlias())
                .build();
        return toDto(repo.save(w));
    }

    @Transactional
    public WaitlistDto update(Long id, WaitlistDto dto) {
        var w = load(id);
        if (dto.getPatientName() != null) w.setPatientName(dto.getPatientName());
        if (dto.getRequestedType() != null) w.setRequestedType(dto.getRequestedType());
        if (dto.getRequestedDate() != null) w.setRequestedDate(dto.getRequestedDate());
        if (dto.getPriority() != null) w.setPriority(dto.getPriority());
        if (dto.getStatus() != null) w.setStatus(dto.getStatus());
        if (dto.getNotes() != null) w.setNotes(dto.getNotes());
        return toDto(repo.save(w));
    }

    @Transactional
    public void delete(Long id) {
        repo.delete(load(id));
    }

    private Waitlist load(Long id) {
        return repo.findById(id)
                .filter(w -> w.getOrgAlias().equals(orgAlias()))
                .orElseThrow(() -> new NoSuchElementException("Waitlist entry not found: " + id));
    }

    private WaitlistDto toDto(Waitlist e) {
        return WaitlistDto.builder()
                .id(e.getId())
                .patientId(e.getPatientId())
                .patientName(e.getPatientName())
                .requestedType(e.getRequestedType())
                .requestedDate(e.getRequestedDate())
                .priority(e.getPriority())
                .status(e.getStatus())
                .notes(e.getNotes())
                .createdAt(e.getCreatedAt() != null ? e.getCreatedAt().toString() : null)
                .updatedAt(e.getUpdatedAt() != null ? e.getUpdatedAt().toString() : null)
                .build();
    }
}
