package com.qiaben.ciyex.repository;

import com.qiaben.ciyex.entity.Provider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProviderRepository extends JpaRepository<Provider, Long> {
    // Single tenant per instance - no orgId filtering needed

    Optional<Provider> findByExternalId(String externalId);

    Optional<Provider> findByEmail(String email);

    @Query("SELECT p.externalId FROM Provider p")
    List<String> findAllExternalIds();

    @Query("SELECT p FROM Provider p WHERE (" +
            "LOWER(p.firstName) LIKE %:search% OR " +
            "LOWER(p.lastName) LIKE %:search% OR " +
            "LOWER(p.npi) LIKE %:search% OR " +
            "LOWER(p.email) LIKE %:search%)")
    List<Provider> searchBy(@Param("search") String search);
}