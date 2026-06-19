package org.ciyex.ehr.billing.repository;

import org.ciyex.ehr.billing.entity.PriceLevel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PriceLevelRepository extends JpaRepository<PriceLevel, Long> {
    List<PriceLevel> findByOrgAliasOrderBySeqAsc(String orgAlias);
}
