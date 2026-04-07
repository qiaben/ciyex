package org.ciyex.ehr.portal.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ciyex.ehr.dto.ApiResponse;
import org.ciyex.ehr.dto.integration.RequestContext;
import org.ciyex.ehr.portal.entity.TemplateDocument;
import org.ciyex.ehr.portal.repository.TemplateDocumentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/template-documents")
@RequiredArgsConstructor
@Slf4j
public class TemplateDocumentController {

    private final TemplateDocumentRepository repo;

    private String orgAlias() {
        return RequestContext.get().getOrgName();
    }

    @GetMapping
    public ResponseEntity<List<TemplateDocument>> list(
            @RequestParam(required = false) String context) {
        var org = orgAlias();
        var docs = context != null
                ? repo.findByOrgAliasAndContextOrderByUpdatedAtDesc(org, context)
                : repo.findByOrgAliasOrderByUpdatedAtDesc(org);
        return ResponseEntity.ok(docs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TemplateDocument> get(@PathVariable Long id) {
        return repo.findById(id)
                .filter(d -> d.getOrgAlias().equals(orgAlias()))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<TemplateDocument> create(@RequestBody TemplateDocument body) {
        body.setId(null);
        body.setOrgAlias(orgAlias());
        var saved = repo.save(body);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TemplateDocument> update(@PathVariable Long id, @RequestBody TemplateDocument body) {
        return repo.findById(id)
                .filter(d -> d.getOrgAlias().equals(orgAlias()))
                .map(existing -> {
                    existing.setName(body.getName());
                    existing.setContext(body.getContext());
                    existing.setContent(body.getContent());
                    existing.setOptions(body.getOptions());
                    return ResponseEntity.ok(repo.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return repo.findById(id)
                .filter(d -> d.getOrgAlias().equals(orgAlias()))
                .map(d -> {
                    repo.delete(d);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
