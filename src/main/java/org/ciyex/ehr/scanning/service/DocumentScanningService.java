package org.ciyex.ehr.scanning.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.ciyex.ehr.dto.integration.RequestContext;
import org.ciyex.ehr.scanning.entity.ScannedDocument;
import org.ciyex.ehr.scanning.repository.ScannedDocumentRepository;
import org.ciyex.ehr.service.storage.FileStorageStrategy;
import org.ciyex.ehr.service.storage.FileStorageStrategyResolver;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentScanningService {

    private final ScannedDocumentRepository repo;
    private final FileStorageStrategyResolver storageResolver;
    private final DocumentTextExtractor textExtractor;

    private String orgAlias() {
        RequestContext rc = RequestContext.get();
        return rc != null ? rc.getOrgName() : "default";
    }

    private String currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : "unknown";
    }

    public Page<ScannedDocument> list(String q, String category, String ocrStatus, int page, int size) {
        String org = orgAlias();
        String qParam = (q == null || q.isBlank()) ? null : q;
        String catParam = (category == null || category.isBlank()) ? null : category;
        String statusParam = (ocrStatus == null || ocrStatus.isBlank()) ? null : ocrStatus;
        Page<ScannedDocument> results = repo.search(org, qParam, catParam, statusParam, PageRequest.of(page, size));
        // Enrich with presigned URLs
        results.forEach(doc -> {
            if (doc.getStorageKey() != null && doc.getFileUrl() == null) {
                try {
                    FileStorageStrategy strategy = storageResolver.resolve(org);
                    String url = strategy.getPresignedUrlByKey(doc.getStorageKey(), 3600);
                    doc.setFileUrl(url);
                } catch (Exception e) {
                    log.warn("Could not generate presigned URL for doc {}: {}", doc.getId(), e.getMessage());
                }
            }
        });
        return results;
    }

    public ScannedDocument upload(MultipartFile file, String category, Long patientId, String patientName) {
        String org = orgAlias();
        String storageKey = org + "/scanning/" + UUID.randomUUID() + "_" + file.getOriginalFilename();

        // Upload to storage
        byte[] fileBytes;
        try {
            FileStorageStrategy strategy = storageResolver.resolve(org);
            fileBytes = file.getBytes();
            strategy.uploadByKey(fileBytes, storageKey, file.getContentType(), org,
                    "document-scanning", patientId != null ? patientId.toString() : null,
                    file.getOriginalFilename());
        } catch (Exception e) {
            log.error("Failed to upload scanned document", e);
            throw new RuntimeException("Failed to upload file: " + e.getMessage(), e);
        }

        ScannedDocument doc = ScannedDocument.builder()
                .fileName(file.getOriginalFilename())
                .originalFileName(file.getOriginalFilename())
                .fileSize(file.getSize())
                .mimeType(file.getContentType())
                .storageKey(storageKey)
                .patientId(patientId)
                .patientName(patientName)
                .category(category != null ? category : "other")
                .ocrStatus(DocumentTextExtractor.STATUS_PENDING)
                .uploadedBy(currentUser())
                .orgAlias(org)
                .build();

        // Extract straight away using the bytes still in hand — the upload is the
        // only moment the content is guaranteed local, and leaving the row at
        // "pending" until someone clicks Run OCR was why the Document Scanning
        // table only ever showed pending/processing.
        applyExtraction(doc, fileBytes);
        return repo.save(doc);
    }

    /**
     * Re-run text extraction for a document and persist the terminal status.
     *
     * <p>Previously this only flipped the row to "processing" and returned — with
     * no worker behind it, that status was permanent, so Completed / Failed / N/A
     * never appeared in the table (and filtering by them returned nothing).
     * Extraction is cheap (a PDF text layer, not raster OCR), so it runs inline
     * and the caller gets the finished record back.
     */
    public ScannedDocument triggerOcr(Long id) {
        String org = orgAlias();
        ScannedDocument doc = repo.findById(id)
                .filter(d -> org.equals(d.getOrgAlias()))
                .orElseThrow(() -> new RuntimeException("Document not found: " + id));

        byte[] bytes = null;
        if (doc.getStorageKey() != null) {
            try {
                bytes = storageResolver.resolve(org).downloadByKey(doc.getStorageKey());
            } catch (Exception e) {
                log.warn("Could not read stored file for doc {}: {}", id, e.getMessage());
            }
        }
        if (bytes == null) {
            doc.setOcrStatus(DocumentTextExtractor.STATUS_FAILED);
            doc.setOcrText(null);
            doc.setOcrConfidence(null);
            return repo.save(doc);
        }
        applyExtraction(doc, bytes);
        return repo.save(doc);
    }

    /** Run the extractor over {@code bytes} and stamp the outcome onto {@code doc}. */
    private void applyExtraction(ScannedDocument doc, byte[] bytes) {
        DocumentTextExtractor.Result result;
        try {
            result = textExtractor.extract(bytes, doc.getOriginalFileName(), doc.getMimeType());
        } catch (Exception e) {
            log.warn("Text extraction blew up for '{}': {}", doc.getOriginalFileName(), e.getMessage());
            result = DocumentTextExtractor.Result.failed(e.getMessage());
        }
        doc.setOcrStatus(result.status());
        doc.setOcrText(result.text());
        doc.setOcrConfidence(result.confidence());
        if (result.message() != null) {
            log.info("Document '{}' -> {}: {}", doc.getOriginalFileName(), result.status(), result.message());
        }
    }

    /**
     * Catch rows left behind by the old {@code triggerOcr}, which only ever set
     * "processing" and never moved them on (see {@link #triggerOcr}). Those documents
     * pre-date {@link #applyExtraction} being wired into the upload/re-run paths and
     * would otherwise sit at pending/processing forever with no way to reach a
     * terminal status. Runs once at startup; a no-op once every row has one.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void reprocessStuck() {
        List<ScannedDocument> stuck = repo.findByOcrStatusIn(List.of(
                DocumentTextExtractor.STATUS_PENDING, DocumentTextExtractor.STATUS_PROCESSING));
        if (stuck.isEmpty()) {
            return;
        }
        log.info("Reprocessing {} scanned document(s) stuck at pending/processing", stuck.size());
        for (ScannedDocument doc : stuck) {
            byte[] bytes = null;
            if (doc.getStorageKey() != null) {
                try {
                    bytes = storageResolver.resolve(doc.getOrgAlias()).downloadByKey(doc.getStorageKey());
                } catch (Exception e) {
                    log.warn("Could not read stored file for doc {}: {}", doc.getId(), e.getMessage());
                }
            }
            if (bytes == null) {
                doc.setOcrStatus(DocumentTextExtractor.STATUS_FAILED);
                doc.setOcrText(null);
                doc.setOcrConfidence(null);
            } else {
                applyExtraction(doc, bytes);
            }
            try {
                repo.save(doc);
            } catch (Exception e) {
                log.warn("Failed to save reprocessed document {}: {}", doc.getId(), e.getMessage());
            }
        }
    }

    public void delete(Long id) {
        String org = orgAlias();
        ScannedDocument doc = repo.findById(id)
                .filter(d -> org.equals(d.getOrgAlias()))
                .orElseThrow(() -> new RuntimeException("Document not found: " + id));

        if (doc.getStorageKey() != null) {
            try {
                FileStorageStrategy strategy = storageResolver.resolve(org);
                strategy.deleteByKey(doc.getStorageKey());
            } catch (Exception e) {
                log.warn("Could not delete file from storage for doc {}: {}", id, e.getMessage());
            }
        }
        repo.delete(doc);
    }
}
