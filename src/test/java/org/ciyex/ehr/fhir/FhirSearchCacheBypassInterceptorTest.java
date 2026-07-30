package org.ciyex.ehr.fhir;

import ca.uhn.fhir.context.FhirContext;
import com.sun.net.httpserver.HttpServer;
import org.hl7.fhir.r4.model.Bundle;
import org.hl7.fhir.r4.model.Patient;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Verifies that reads issued through {@link FhirClientService} opt out of the FHIR
 * server's search result cache.
 *
 * <p>The server runs with {@code reuse_cached_search_results_millis} set, so without
 * {@code Cache-Control: no-cache} it replays the previous result set for a repeated
 * identical search and a just-written resource stays invisible to the next read.
 * These tests pin the header onto the paths that matter — including a search taken
 * straight off {@link FhirClientService#getClient(String)}, which is how the generic
 * resource search used by every tab issues its queries.</p>
 */
class FhirSearchCacheBypassInterceptorTest {

    /** One captured inbound request: the request line's URI and its Cache-Control values. */
    private record CapturedRequest(String uri, List<String> cacheControl) { }

    private HttpServer server;
    private List<CapturedRequest> requests;
    private FhirClientService fhirClientService;

    @BeforeEach
    void setUp() throws Exception {
        requests = new CopyOnWriteArrayList<>();
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/", exchange -> {
            List<String> cacheControl = exchange.getRequestHeaders().get("Cache-Control");
            requests.add(new CapturedRequest(
                    exchange.getRequestURI().toString(),
                    cacheControl == null ? List.of() : List.copyOf(cacheControl)));
            try (InputStream ignored = exchange.getRequestBody()) {
                // drain so the connection can be reused
            }
            byte[] body = "{\"resourceType\":\"Bundle\",\"type\":\"searchset\",\"total\":0}"
                    .getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/fhir+json");
            exchange.sendResponseHeaders(200, body.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(body);
            }
        });
        server.start();

        String baseUrl = "http://127.0.0.1:" + server.getAddress().getPort() + "/fhir";
        fhirClientService = new FhirClientService(
                FhirContext.forR4(),
                new FhirBearerTokenInterceptor(),
                new FhirSearchCacheBypassInterceptor(),
                baseUrl,
                10000,
                5000);
    }

    @AfterEach
    void tearDown() {
        server.stop(0);
    }

    private List<String> allCacheControlValues() {
        List<String> values = new ArrayList<>();
        requests.forEach(r -> values.addAll(r.cacheControl()));
        return values;
    }

    @Test
    void searchSendsNoCacheSoWritesAreVisibleToTheNextRead() {
        fhirClientService.search(Patient.class, "test-org");

        assertEquals(1, requests.size());
        assertEquals(List.of("no-cache"), allCacheControlValues(),
                "search must opt out of the server search cache, exactly once");
    }

    @Test
    void searchOffTheRawClientAlsoSendsNoCache() {
        // The path GenericFhirResourceService uses for every tab's list and search.
        fhirClientService.getClient("test-org").search()
                .forResource(Patient.class)
                .returnBundle(Bundle.class)
                .execute();

        assertEquals(List.of("no-cache"), allCacheControlValues(),
                "searches issued off getClient() must opt out too");
    }

    @Test
    void pagedSearchFetchesTheRequestedPageInOneRequest() {
        fhirClientService.searchPaged(Patient.class, "test-org", 20, 200);

        assertEquals(1, requests.size(),
                "a deep page must not cost one round trip per page skipped");
        String uri = requests.get(0).uri();
        assertTrue(uri.contains("_offset=200"), "expected _offset paging, got: " + uri);
        assertTrue(uri.contains("_count=20"), "expected _count preserved, got: " + uri);
    }
}
