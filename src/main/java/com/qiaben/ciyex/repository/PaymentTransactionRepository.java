package com.qiaben.ciyex.repository;

import com.qiaben.ciyex.entity.PaymentTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    Page<PaymentTransaction> findByOrgAliasOrderByCreatedAtDesc(String orgAlias, Pageable pageable);

    List<PaymentTransaction> findByOrgAliasOrderByCreatedAtDesc(String orgAlias);

    Optional<PaymentTransaction> findByIdAndOrgAlias(Long id, String orgAlias);

    long countByOrgAliasAndStatus(String orgAlias, String status);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM PaymentTransaction t WHERE t.orgAlias = :orgAlias AND t.status = 'completed'")
    BigDecimal sumCompletedByOrgAlias(@Param("orgAlias") String orgAlias);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM PaymentTransaction t WHERE t.orgAlias = :orgAlias AND t.status = 'refunded'")
    BigDecimal sumRefundedByOrgAlias(@Param("orgAlias") String orgAlias);
}
