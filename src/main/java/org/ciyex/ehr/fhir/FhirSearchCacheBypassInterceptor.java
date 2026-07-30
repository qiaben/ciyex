package org.ciyex.ehr.fhir;

import ca.uhn.fhir.rest.client.api.IClientInterceptor;
import ca.uhn.fhir.rest.client.api.IHttpRequest;
import ca.uhn.fhir.rest.client.api.IHttpResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * HAPI FHIR client interceptor that opts every outgoing request out of the
 * FHIR server's <em>search result cache</em>.
 *
 * <p>The FHIR server runs with {@code reuse_cached_search_results_millis: 60000},
 * so it replays the previously returned result set for any repeat of an
 * identical search issued within 60 seconds — the same {@code Bundle.id} comes
 * back and the underlying tables are never re-queried. A resource created or
 * updated in that window is therefore invisible to the very next read, which is
 * why a create/update appeared to take "up to a minute" to show up in a list.</p>
 *
 * <p>Sending {@code Cache-Control: no-cache} makes the server execute the search
 * against the database instead of replaying the cached set, so a write is
 * visible to the next read immediately. Measured on dev: identical searches went
 * from a frozen result set for 58s to fresh data in ~0.2s, with no latency cost
 * (a cache hit and a fresh query both return in ~0.2s on this data volume).</p>
 *
 * <p>This is registered on the shared per-partition client rather than being
 * applied at individual call sites so that every read path — including the
 * generic resource search used by all tabs — is covered, and new call sites
 * inherit it. {@code no-cache} only suppresses <em>reuse</em> of a stored
 * result set; the stored set is still written, so {@code _getpages} paging
 * through a "next" link continues to work.</p>
 *
 * @see FhirBearerTokenInterceptor
 */
@Component
@Slf4j
public class FhirSearchCacheBypassInterceptor implements IClientInterceptor {

    @Override
    public void interceptRequest(IHttpRequest theRequest) {
        theRequest.addHeader("Cache-Control", "no-cache");
        log.trace("Requested FHIR search-cache bypass");
    }

    @Override
    public void interceptResponse(IHttpResponse theResponse) {
        // no-op
    }
}
