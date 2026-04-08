/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Ciyex Inc. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
package org.ciyex.ehr.licensing.repository;

import org.ciyex.ehr.licensing.entity.ExtensionLicense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExtensionLicenseRepository extends JpaRepository<ExtensionLicense, UUID> {

    Optional<ExtensionLicense> findByOrgAliasAndExtensionId(String orgAlias, String extensionId);

    List<ExtensionLicense> findByOrgAlias(String orgAlias);

    Optional<ExtensionLicense> findByStripeSubId(String stripeSubId);
}
