package org.ciyex.ehr.portal.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ciyex.ehr.dto.ApiResponse;
import org.ciyex.ehr.dto.integration.RequestContext;
import org.ciyex.ehr.portal.entity.PortalForm;
import org.ciyex.ehr.portal.entity.TemplateDocument;
import org.ciyex.ehr.portal.repository.TemplateDocumentRepository;
import org.ciyex.ehr.portal.service.PortalConfigService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/template-documents")
@RequiredArgsConstructor
@Slf4j
public class TemplateDocumentController {

    private final TemplateDocumentRepository repo;
    private final PortalConfigService portalConfigService;

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
        if ("PORTAL".equalsIgnoreCase(saved.getContext())) {
            syncPortalForm(saved);
        }
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
                    var saved = repo.save(existing);
                    if ("PORTAL".equalsIgnoreCase(saved.getContext())) {
                        syncPortalForm(saved);
                    }
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return repo.findById(id)
                .filter(d -> d.getOrgAlias().equals(orgAlias()))
                .map(d -> {
                    if ("PORTAL".equalsIgnoreCase(d.getContext())) {
                        portalConfigService.deleteFormByKey(d.getOrgAlias(), "tpl-" + d.getId());
                    }
                    repo.delete(d);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/render")
    public ResponseEntity<Map<String, Object>> render(@PathVariable Long id) {
        return repo.findById(id)
                .filter(d -> d.getOrgAlias().equals(orgAlias()))
                .map(d -> {
                    Map<String, Object> result = new HashMap<>();
                    result.put("html", d.getContent());
                    result.put("name", d.getName());
                    return ResponseEntity.ok(result);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private void syncPortalForm(TemplateDocument template) {
        String formKey = "tpl-" + template.getId();
        Map<String, Object> fieldConfig = new HashMap<>();
        fieldConfig.put("htmlTemplate", true);
        fieldConfig.put("templateDocId", template.getId());

        PortalForm form = PortalForm.builder()
                .formKey(formKey)
                .formType("custom")
                .title(template.getName())
                .description("HTML template form")
                .fieldConfig(fieldConfig)
                .settings(new HashMap<>())
                .active(true)
                .position(0)
                .build();

        portalConfigService.saveForm(template.getOrgAlias(), form);
    }
}
