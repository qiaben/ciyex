package org.ciyex.ehr.billing.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ciyex.ehr.billing.dto.PriceLevelDto;
import org.ciyex.ehr.billing.entity.PriceLevel;
import org.ciyex.ehr.billing.repository.PriceLevelRepository;
import org.ciyex.ehr.dto.integration.RequestContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Slf4j
public class PriceLevelService {

    private final PriceLevelRepository repo;

    private String orgAlias() {
        return RequestContext.get().getOrgName();
    }

    @Transactional(readOnly = true)
    public List<PriceLevelDto> getAll() {
        return repo.findByOrgAliasOrderBySeqAsc(orgAlias()).stream().map(this::toDto).toList();
    }

    @Transactional
    public PriceLevelDto create(PriceLevelDto dto) {
        var pl = PriceLevel.builder()
                .optionId(dto.getOptionId())
                .title(dto.getTitle())
                .seq(dto.getSeq() != null ? dto.getSeq() : 0)
                .isDefault(Boolean.TRUE.equals(dto.getIsDefault()))
                .active(dto.getActive() == null || dto.getActive())
                .notes(dto.getNotes())
                .codes(dto.getCodes())
                .orgAlias(orgAlias())
                .build();
        return toDto(repo.save(pl));
    }

    @Transactional
    public PriceLevelDto update(Long id, PriceLevelDto dto) {
        var pl = repo.findById(id)
                .filter(p -> p.getOrgAlias().equals(orgAlias()))
                .orElseThrow(() -> new NoSuchElementException("Price level not found: " + id));
        if (dto.getOptionId() != null) pl.setOptionId(dto.getOptionId());
        if (dto.getTitle() != null) pl.setTitle(dto.getTitle());
        if (dto.getSeq() != null) pl.setSeq(dto.getSeq());
        if (dto.getIsDefault() != null) pl.setIsDefault(dto.getIsDefault());
        if (dto.getActive() != null) pl.setActive(dto.getActive());
        if (dto.getNotes() != null) pl.setNotes(dto.getNotes());
        if (dto.getCodes() != null) pl.setCodes(dto.getCodes());
        return toDto(repo.save(pl));
    }

    @Transactional
    public void delete(Long id) {
        var pl = repo.findById(id)
                .filter(p -> p.getOrgAlias().equals(orgAlias()))
                .orElseThrow(() -> new NoSuchElementException("Price level not found: " + id));
        repo.delete(pl);
    }

    private PriceLevelDto toDto(PriceLevel e) {
        return PriceLevelDto.builder()
                .id(e.getId())
                .optionId(e.getOptionId())
                .title(e.getTitle())
                .seq(e.getSeq())
                .isDefault(e.getIsDefault())
                .active(e.getActive())
                .notes(e.getNotes())
                .codes(e.getCodes())
                .createdAt(e.getCreatedAt() != null ? e.getCreatedAt().toString() : null)
                .updatedAt(e.getUpdatedAt() != null ? e.getUpdatedAt().toString() : null)
                .build();
    }
}
