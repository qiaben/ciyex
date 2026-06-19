package org.ciyex.ehr.billing.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ciyex.ehr.billing.dto.FeeSheetDto;
import org.ciyex.ehr.billing.entity.FeeSheet;
import org.ciyex.ehr.billing.repository.FeeSheetRepository;
import org.ciyex.ehr.dto.integration.RequestContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeeSheetService {

    private final FeeSheetRepository repo;

    private String orgAlias() {
        return RequestContext.get().getOrgName();
    }

    @Transactional(readOnly = true)
    public List<FeeSheetDto> getAll() {
        return repo.findByOrgAliasOrderByCreatedAtDesc(orgAlias()).stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public FeeSheetDto getByEncounter(String encounterId) {
        return repo.findFirstByOrgAliasAndEncounterIdOrderByCreatedAtDesc(orgAlias(), encounterId)
                .map(this::toDto).orElse(null);
    }

    @Transactional
    public FeeSheetDto create(FeeSheetDto dto) {
        var fs = FeeSheet.builder()
                .encounterId(dto.getEncounterId())
                .patientId(dto.getPatientId())
                .patientName(dto.getPatientName())
                .priceLevel(dto.getPriceLevel())
                .renderingProvider(dto.getRenderingProvider())
                .renderingProviderName(dto.getRenderingProviderName())
                .supervisingProvider(dto.getSupervisingProvider())
                .total(dto.getTotal() != null ? dto.getTotal() : computeTotal(dto.getItems()))
                .totalPaid(dto.getTotalPaid() != null ? dto.getTotalPaid() : BigDecimal.ZERO)
                .billingStatus(dto.getBillingStatus() != null ? dto.getBillingStatus() : "Unbilled")
                .billedMode(dto.getBilledMode() != null ? dto.getBilledMode() : "cash")
                .paymentStatus(dto.getPaymentStatus() != null ? dto.getPaymentStatus() : "None")
                .comments(dto.getComments())
                .items(dto.getItems() != null ? dto.getItems() : List.of())
                .orgAlias(orgAlias())
                .build();
        return toDto(repo.save(fs));
    }

    @Transactional
    public FeeSheetDto update(Long id, FeeSheetDto dto) {
        var fs = load(id);
        if (dto.getEncounterId() != null) fs.setEncounterId(dto.getEncounterId());
        if (dto.getPatientId() != null) fs.setPatientId(dto.getPatientId());
        if (dto.getPatientName() != null) fs.setPatientName(dto.getPatientName());
        if (dto.getPriceLevel() != null) fs.setPriceLevel(dto.getPriceLevel());
        if (dto.getRenderingProvider() != null) fs.setRenderingProvider(dto.getRenderingProvider());
        if (dto.getRenderingProviderName() != null) fs.setRenderingProviderName(dto.getRenderingProviderName());
        if (dto.getSupervisingProvider() != null) fs.setSupervisingProvider(dto.getSupervisingProvider());
        if (dto.getComments() != null) fs.setComments(dto.getComments());
        if (dto.getItems() != null) {
            fs.setItems(dto.getItems());
            fs.setTotal(dto.getTotal() != null ? dto.getTotal() : computeTotal(dto.getItems()));
        } else if (dto.getTotal() != null) {
            fs.setTotal(dto.getTotal());
        }
        return toDto(repo.save(fs));
    }

    /**
     * Push the fee sheet to billing: mark it Billed so it surfaces (as an open
     * charge) on the Encounter Billing dashboard. Returns the updated sheet.
     */
    @Transactional
    public FeeSheetDto bill(Long id, Map<String, Object> body) {
        var fs = load(id);
        fs.setBillingStatus("Billed");
        if (body != null && body.get("billedMode") != null) {
            fs.setBilledMode(String.valueOf(body.get("billedMode")));
        }
        return toDto(repo.save(fs));
    }

    private FeeSheet load(Long id) {
        return repo.findById(id)
                .filter(f -> f.getOrgAlias().equals(orgAlias()))
                .orElseThrow(() -> new NoSuchElementException("Fee sheet not found: " + id));
    }

    private BigDecimal computeTotal(List<Map<String, Object>> items) {
        if (items == null) return BigDecimal.ZERO;
        BigDecimal sum = BigDecimal.ZERO;
        for (var it : items) {
            double price = toNum(it.get("price"));
            double qty = it.get("qty") != null ? toNum(it.get("qty")) : 1;
            sum = sum.add(BigDecimal.valueOf(price * qty));
        }
        return sum;
    }

    private double toNum(Object o) {
        if (o instanceof Number n) return n.doubleValue();
        try { return o != null ? Double.parseDouble(String.valueOf(o)) : 0; } catch (Exception e) { return 0; }
    }

    private FeeSheetDto toDto(FeeSheet e) {
        return FeeSheetDto.builder()
                .id(e.getId())
                .encounterId(e.getEncounterId())
                .patientId(e.getPatientId())
                .patientName(e.getPatientName())
                .priceLevel(e.getPriceLevel())
                .renderingProvider(e.getRenderingProvider())
                .renderingProviderName(e.getRenderingProviderName())
                .supervisingProvider(e.getSupervisingProvider())
                .total(e.getTotal())
                .totalPaid(e.getTotalPaid())
                .billingStatus(e.getBillingStatus())
                .billedMode(e.getBilledMode())
                .paymentStatus(e.getPaymentStatus())
                .comments(e.getComments())
                .items(e.getItems())
                .encounterDate(e.getCreatedAt() != null ? e.getCreatedAt().toLocalDate().toString() : null)
                .createdAt(e.getCreatedAt() != null ? e.getCreatedAt().toString() : null)
                .updatedAt(e.getUpdatedAt() != null ? e.getUpdatedAt().toString() : null)
                .build();
    }
}
