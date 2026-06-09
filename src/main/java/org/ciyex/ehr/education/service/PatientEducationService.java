package org.ciyex.ehr.education.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ciyex.ehr.dto.integration.RequestContext;
import org.ciyex.ehr.education.dto.PatientEducationAssignmentDto;
import org.ciyex.ehr.education.entity.PatientEducationAssignment;
import org.ciyex.ehr.education.repository.EducationMaterialRepository;
import org.ciyex.ehr.education.repository.PatientEducationAssignmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientEducationService {

    private final PatientEducationAssignmentRepository repo;
    private final EducationMaterialRepository materialRepo;

    private String orgAlias() {
        return RequestContext.get().getOrgName();
    }

    @Transactional
    public PatientEducationAssignmentDto assign(PatientEducationAssignmentDto dto) {
        // Up-front validation — without these, JPA throws the cryptic
        // "The given id must not be null" when the UI omits patientId or
        // materialId. Reject with a user-readable message instead.
        if (dto.getPatientId() == null) {
            throw new IllegalArgumentException("Patient is required");
        }
        if (dto.getMaterialId() == null) {
            throw new IllegalArgumentException("Education material is required");
        }
        // Validate material exists
        materialRepo.findById(dto.getMaterialId())
                .filter(m -> m.getOrgAlias().equals(orgAlias()))
                .orElseThrow(() -> new NoSuchElementException("Material not found: " + dto.getMaterialId()));

        var assignment = PatientEducationAssignment.builder()
                .patientId(dto.getPatientId())
                .patientName(dto.getPatientName())
                .materialId(dto.getMaterialId())
                .assignedBy(dto.getAssignedBy())
                .assignedDate(dto.getAssignedDate() != null ? parseDate(dto.getAssignedDate()) : LocalDate.now())
                .dueDate(dto.getDueDate() != null ? parseDate(dto.getDueDate()) : null)
                .status(dto.getStatus() != null && !dto.getStatus().isBlank() ? dto.getStatus() : "assigned")
                .deliveryMethod(dto.getDeliveryMethod())
                .educator(dto.getEducator())
                .educatorName(dto.getEducatorName())
                .encounterId(dto.getEncounterId())
                .notes(dto.getNotes())
                .orgAlias(orgAlias())
                .build();
        assignment = repo.save(assignment);
        return toDto(assignment);
    }

    @Transactional(readOnly = true)
    public List<PatientEducationAssignmentDto> listAll() {
        return repo.findByOrgAliasOrderByCreatedAtDesc(orgAlias())
                .stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<PatientEducationAssignmentDto> getByPatient(Long patientId) {
        return repo.findByOrgAliasAndPatientIdOrderByAssignedDateDesc(orgAlias(), patientId)
                .stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public PatientEducationAssignmentDto getById(Long id) {
        return repo.findById(id)
                .filter(a -> a.getOrgAlias().equals(orgAlias()))
                .map(this::toDto)
                .orElseThrow(() -> new NoSuchElementException("Assignment not found: " + id));
    }

    @Transactional
    public PatientEducationAssignmentDto update(Long id, PatientEducationAssignmentDto dto) {
        var assignment = repo.findById(id)
                .filter(a -> a.getOrgAlias().equals(orgAlias()))
                .orElseThrow(() -> new NoSuchElementException("Assignment not found: " + id));

        if (dto.getPatientId() != null) assignment.setPatientId(dto.getPatientId());
        if (dto.getPatientName() != null) assignment.setPatientName(dto.getPatientName());
        if (dto.getMaterialId() != null) assignment.setMaterialId(dto.getMaterialId());
        if (dto.getAssignedBy() != null) assignment.setAssignedBy(dto.getAssignedBy());
        if (dto.getAssignedDate() != null) assignment.setAssignedDate(parseDate(dto.getAssignedDate()));
        if (dto.getDueDate() != null) assignment.setDueDate(parseDate(dto.getDueDate()));
        if (dto.getStatus() != null) assignment.setStatus(dto.getStatus());
        if (dto.getDeliveryMethod() != null) assignment.setDeliveryMethod(dto.getDeliveryMethod());
        if (dto.getEducator() != null) assignment.setEducator(dto.getEducator());
        if (dto.getEducatorName() != null) assignment.setEducatorName(dto.getEducatorName());
        if (dto.getEncounterId() != null) assignment.setEncounterId(dto.getEncounterId());
        if (dto.getNotes() != null) assignment.setNotes(dto.getNotes());
        if (dto.getPatientFeedback() != null) assignment.setPatientFeedback(dto.getPatientFeedback());

        return toDto(repo.save(assignment));
    }

    @Transactional
    public PatientEducationAssignmentDto markViewed(Long id) {
        var assignment = repo.findById(id)
                .filter(a -> a.getOrgAlias().equals(orgAlias()))
                .orElseThrow(() -> new NoSuchElementException("Assignment not found: " + id));
        assignment.setStatus("viewed");
        assignment.setViewedAt(LocalDateTime.now());
        return toDto(repo.save(assignment));
    }

    @Transactional
    public PatientEducationAssignmentDto markCompleted(Long id) {
        var assignment = repo.findById(id)
                .filter(a -> a.getOrgAlias().equals(orgAlias()))
                .orElseThrow(() -> new NoSuchElementException("Assignment not found: " + id));
        assignment.setStatus("completed");
        assignment.setCompletedAt(LocalDateTime.now());
        if (assignment.getViewedAt() == null) {
            assignment.setViewedAt(LocalDateTime.now());
        }
        return toDto(repo.save(assignment));
    }

    @Transactional
    public PatientEducationAssignmentDto dismiss(Long id) {
        var assignment = repo.findById(id)
                .filter(a -> a.getOrgAlias().equals(orgAlias()))
                .orElseThrow(() -> new NoSuchElementException("Assignment not found: " + id));
        assignment.setStatus("dismissed");
        return toDto(repo.save(assignment));
    }

    @Transactional
    public void delete(Long id) {
        var assignment = repo.findById(id)
                .filter(a -> a.getOrgAlias().equals(orgAlias()))
                .orElseThrow(() -> new NoSuchElementException("Assignment not found: " + id));
        repo.delete(assignment);
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getPatientStats(Long patientId) {
        String org = orgAlias();
        Map<String, Long> stats = new LinkedHashMap<>();
        stats.put("assigned", repo.countByOrgAliasAndPatientIdAndStatus(org, patientId, "assigned"));
        stats.put("viewed", repo.countByOrgAliasAndPatientIdAndStatus(org, patientId, "viewed"));
        stats.put("completed", repo.countByOrgAliasAndPatientIdAndStatus(org, patientId, "completed"));
        stats.put("dismissed", repo.countByOrgAliasAndPatientIdAndStatus(org, patientId, "dismissed"));
        return stats;
    }

    private LocalDate parseDate(String s) {
        if (s == null || s.isBlank()) return LocalDate.now();
        try {
            if (s.contains("T")) return Instant.parse(s).atZone(ZoneId.systemDefault()).toLocalDate();
            if (s.matches("\\d{2}-\\d{2}-\\d{4}")) return LocalDate.parse(s, DateTimeFormatter.ofPattern("dd-MM-yyyy"));
            return LocalDate.parse(s);
        } catch (Exception e) {
            log.warn("Failed to parse date '{}', using today", s);
            return LocalDate.now();
        }
    }

    private PatientEducationAssignmentDto toDto(PatientEducationAssignment e) {
        // Enrich with material info
        String materialTitle = null;
        String materialCategory = null;
        String materialContentType = null;
        if (e.getMaterialId() != null) {
            var material = materialRepo.findById(e.getMaterialId()).orElse(null);
            if (material != null) {
                materialTitle = material.getTitle();
                materialCategory = material.getCategory();
                materialContentType = material.getContentType();
            }
        }

        return PatientEducationAssignmentDto.builder()
                .id(e.getId())
                .patientId(e.getPatientId())
                .patientName(e.getPatientName())
                .materialId(e.getMaterialId())
                .materialTitle(materialTitle)
                .materialCategory(materialCategory)
                .materialContentType(materialContentType)
                .assignedBy(e.getAssignedBy())
                .assignedDate(e.getAssignedDate() != null ? e.getAssignedDate().toString() : null)
                .dueDate(e.getDueDate() != null ? e.getDueDate().toString() : null)
                .status(e.getStatus())
                .deliveryMethod(e.getDeliveryMethod())
                .educator(e.getEducator())
                .educatorName(e.getEducatorName())
                .viewedAt(e.getViewedAt() != null ? e.getViewedAt().toString() : null)
                .completedAt(e.getCompletedAt() != null ? e.getCompletedAt().toString() : null)
                .encounterId(e.getEncounterId())
                .notes(e.getNotes())
                .patientFeedback(e.getPatientFeedback())
                .createdAt(e.getCreatedAt() != null ? e.getCreatedAt().toString() : null)
                .updatedAt(e.getUpdatedAt() != null ? e.getUpdatedAt().toString() : null)
                .build();
    }
}
