/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Ciyex Inc. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
package org.ciyex.ehr.marketplace.controller;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

/**
 * Proxies VS Code gallery requests to the self-hosted Open VSX registry,
 * fixing response format issues (null files array) that break VS Code's
 * extension marketplace UI.
 */
@RestController
@RequestMapping("/api/marketplace")
public class GalleryProxyController {

    private static final String OPENVSX_URL = "https://marketplace-dev.ciyexhub.com";

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/extensionquery")
    public ResponseEntity<String> extensionQuery(@RequestBody String body, @RequestHeader HttpHeaders headers) {
        try {
            HttpHeaders proxyHeaders = new HttpHeaders();
            proxyHeaders.setContentType(MediaType.APPLICATION_JSON);
            proxyHeaders.set("Accept", "application/json;api-version=3.0-preview.1");

            HttpEntity<String> request = new HttpEntity<>(body, proxyHeaders);
            ResponseEntity<String> response = restTemplate.exchange(
                    OPENVSX_URL + "/vscode/gallery/extensionquery",
                    HttpMethod.POST,
                    request,
                    String.class
            );

            // Fix null files arrays — replace "files":null with "files":[]
            String fixed = response.getBody();
            if (fixed != null) {
                fixed = fixed.replace("\"files\":null", "\"files\":[]");
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(fixed);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("{\"error\":\"Gallery proxy error: " + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/item")
    public ResponseEntity<String> getItem(@RequestParam String itemName) {
        try {
            String[] parts = itemName.split("\\.");
            String publisher = parts.length > 0 ? parts[0] : "";
            String name = parts.length > 1 ? parts[1] : "";

            ResponseEntity<String> response = restTemplate.getForEntity(
                    OPENVSX_URL + "/api/" + publisher + "/" + name,
                    String.class
            );
            return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(404).body("{\"error\":\"Extension not found\"}");
        }
    }
}
