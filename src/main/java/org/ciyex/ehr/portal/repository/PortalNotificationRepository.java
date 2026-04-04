package org.ciyex.ehr.portal.repository;

import org.ciyex.ehr.portal.entity.PortalNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PortalNotificationRepository extends JpaRepository<PortalNotification, Long> {

    List<PortalNotification> findByPatientEmailAndOrgAliasOrderByCreatedAtDesc(String patientEmail, String orgAlias);

    Optional<PortalNotification> findByIdAndPatientEmail(Long id, String patientEmail);
}
