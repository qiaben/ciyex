package org.ciyex.ehr.portal.repository;

import org.ciyex.ehr.portal.entity.PortalFormSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PortalFormSubmissionRepository extends JpaRepository<PortalFormSubmission, Long> {

    List<PortalFormSubmission> findByOrgAliasOrderBySubmittedDateDesc(String orgAlias);

    List<PortalFormSubmission> findByOrgAliasAndStatusOrderBySubmittedDateDesc(String orgAlias, String status);

    List<PortalFormSubmission> findByOrgAliasAndPatientIdOrderBySubmittedDateDesc(String orgAlias, String patientId);

    List<PortalFormSubmission> findByOrgAliasAndPatientIdAndStatusOrderBySubmittedDateDesc(
            String orgAlias, String patientId, String status);
}
