package org.ciyex.ehr.billing.repository;

import org.ciyex.ehr.billing.entity.FeeSheet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FeeSheetRepository extends JpaRepository<FeeSheet, Long> {
    List<FeeSheet> findByOrgAliasOrderByCreatedAtDesc(String orgAlias);
    Optional<FeeSheet> findFirstByOrgAliasAndEncounterIdOrderByCreatedAtDesc(String orgAlias, String encounterId);
}
