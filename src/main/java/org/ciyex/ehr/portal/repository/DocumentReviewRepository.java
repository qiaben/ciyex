package org.ciyex.ehr.portal.repository;

import org.ciyex.ehr.portal.entity.DocumentReview;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DocumentReviewRepository extends JpaRepository<DocumentReview, Long> {

    List<DocumentReview> findByOrgAliasAndStatusOrderByCreatedAtDesc(String orgAlias, String status);

    Optional<DocumentReview> findByIdAndOrgAlias(Long id, String orgAlias);

    Optional<DocumentReview> findByFhirIdAndOrgAlias(String fhirId, String orgAlias);

    List<DocumentReview> findByPatientEmailAndOrgAlias(String patientEmail, String orgAlias);
}
