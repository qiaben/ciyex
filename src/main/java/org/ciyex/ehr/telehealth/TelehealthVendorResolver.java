package org.ciyex.ehr.telehealth;

import lombok.extern.slf4j.Slf4j;
import org.ciyex.ehr.marketplace.entity.AppInstallation;
import org.ciyex.ehr.marketplace.repository.AppInstallationRepository;
import org.ciyex.sdk.telehealth.TelehealthProvider;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Resolves the appropriate TelehealthProvider for an organization based on
 * the vendor_id configured in their app_installations entry for ciyex-telehealth.
 */
@Service
@Slf4j
public class TelehealthVendorResolver {

    private static final String TELEHEALTH_APP_SLUG = "ciyex-telehealth";

    private final Map<String, TelehealthProvider> providersByVendorId;
    private final TelehealthProvider defaultProvider;
    private final AppInstallationRepository appInstallationRepository;

    public TelehealthVendorResolver(
            List<TelehealthProvider> providers,
            AppInstallationRepository appInstallationRepository) {
        this.appInstallationRepository = appInstallationRepository;
        this.providersByVendorId = providers.stream()
                .collect(Collectors.toMap(TelehealthProvider::vendorId, Function.identity()));
        this.defaultProvider = providers.isEmpty() ? null : providers.getFirst();
        log.info("Registered telehealth providers: {}", providersByVendorId.keySet());
    }

    /**
     * Resolve the TelehealthProvider for a given org alias.
     * Looks up the app_installations table for the org's telehealth config,
     * extracts vendor_id, and returns the matching provider.
     * Falls back to the first available provider if no config found.
     */
    public TelehealthProvider resolve(String orgAlias) {
        if (orgAlias == null || orgAlias.isBlank()) {
            log.debug("No org alias provided, using default telehealth provider");
            return defaultProvider;
        }

        try {
            Optional<AppInstallation> installation = appInstallationRepository
                    .findByOrgIdAndAppSlug(orgAlias, TELEHEALTH_APP_SLUG);

            if (installation.isPresent()) {
                Map<String, Object> config = installation.get().getConfig();
                if (config != null) {
                    Object vendorId = config.get("vendor_id");
                    if (vendorId != null) {
                        String vid = vendorId.toString();
                        TelehealthProvider provider = providersByVendorId.get(vid);
                        if (provider != null) {
                            log.debug("Resolved telehealth vendor '{}' for org '{}'", vid, orgAlias);
                            return provider;
                        }
                        log.warn("Configured vendor_id '{}' for org '{}' has no registered provider, falling back to default", vid, orgAlias);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to resolve telehealth vendor for org '{}': {}", orgAlias, e.getMessage());
        }

        log.debug("Using default telehealth provider for org '{}'", orgAlias);
        return defaultProvider;
    }

    /**
     * Get a provider by explicit vendor ID (used when vendor is already known).
     */
    public TelehealthProvider getByVendorId(String vendorId) {
        TelehealthProvider provider = providersByVendorId.get(vendorId);
        return provider != null ? provider : defaultProvider;
    }
}
