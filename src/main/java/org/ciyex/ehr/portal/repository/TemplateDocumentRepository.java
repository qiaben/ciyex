package org.ciyex.ehr.portal.repository;

import org.ciyex.ehr.portal.entity.TemplateDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TemplateDocumentRepository extends JpaRepository<TemplateDocument, Long> {

    List<TemplateDocument> findByOrgAliasOrderByUpdatedAtDesc(String orgAlias);

    List<TemplateDocument> findByOrgAliasAndContextOrderByUpdatedAtDesc(String orgAlias, String context);
}
