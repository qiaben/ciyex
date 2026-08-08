package org.ciyex.ehr.scanning.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Locale;

/**
 * Extracts the text layer out of an uploaded scan so a document can actually
 * reach a terminal OCR status.
 *
 * <p>There is no raster OCR engine (Tesseract et al.) deployed with the API, so
 * this handles the two shapes we CAN read losslessly — PDFs that carry a text
 * layer (every document this app generates: statements, visit summaries,
 * encounter exports) and plain-text/CSV uploads — and reports anything else as
 * {@code not_applicable} rather than leaving it parked in {@code processing}
 * forever. That dead end was the actual defect: {@code triggerOcr} set
 * "processing" and nothing ever moved it on, so Completed / Failed / N/A were
 * unreachable and filtering the Document Scanning table by them returned
 * nothing.
 */
@Component
@Slf4j
public class DocumentTextExtractor {

    /** OCR status values, mirrored by the workspace UI's OCR_STATUSES list. */
    public static final String STATUS_PENDING = "pending";
    public static final String STATUS_PROCESSING = "processing";
    public static final String STATUS_COMPLETED = "completed";
    public static final String STATUS_FAILED = "failed";
    public static final String STATUS_NOT_APPLICABLE = "not_applicable";

    /** Outcome of one extraction attempt: the terminal status plus what we read. */
    public record Result(String status, String text, Double confidence, String message) {

        public static Result completed(String text, double confidence) {
            return new Result(STATUS_COMPLETED, text, confidence, null);
        }

        public static Result notApplicable(String message) {
            return new Result(STATUS_NOT_APPLICABLE, null, null, message);
        }

        public static Result failed(String message) {
            return new Result(STATUS_FAILED, null, null, message);
        }
    }

    /**
     * Read whatever text the file carries.
     *
     * @param bytes            raw file content
     * @param originalFileName used for the extension fallback when the mime type is absent/generic
     * @param mimeType         declared content type (may be null)
     */
    public Result extract(byte[] bytes, String originalFileName, String mimeType) {
        if (bytes == null || bytes.length == 0) {
            return Result.failed("The stored file is empty.");
        }
        String kind = classify(originalFileName, mimeType);
        return switch (kind) {
            case "pdf" -> extractPdf(bytes);
            case "text" -> extractPlainText(bytes);
            case "image" -> Result.notApplicable(
                    "Image scans need an OCR engine, which is not enabled on this server.");
            default -> Result.notApplicable(
                    "Text extraction is not supported for this file type.");
        };
    }

    private Result extractPdf(byte[] bytes) {
        try (PDDocument pdf = PDDocument.load(bytes)) {
            if (pdf.isEncrypted()) {
                return Result.failed("The PDF is password-protected and cannot be read.");
            }
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            String text = normalize(stripper.getText(pdf));
            if (text.isEmpty()) {
                // A scanned-to-image PDF has pages but no text layer — that is not a
                // failure, it is simply beyond what we can read without an OCR engine.
                return Result.notApplicable(
                        "The PDF has no text layer (image-only scan) and OCR is not enabled on this server.");
            }
            // A text layer is read verbatim, so confidence is not a guess.
            return Result.completed(text, 1.0d);
        } catch (Exception e) {
            log.warn("PDF text extraction failed: {}", e.getMessage());
            return Result.failed("The PDF could not be read: " + e.getMessage());
        }
    }

    private Result extractPlainText(byte[] bytes) {
        String text = normalize(new String(bytes, StandardCharsets.UTF_8));
        if (text.isEmpty()) {
            return Result.failed("The file contains no readable text.");
        }
        return Result.completed(text, 1.0d);
    }

    /** Bucket the upload into pdf / text / image / other. */
    private String classify(String fileName, String mimeType) {
        String mime = mimeType == null ? "" : mimeType.toLowerCase(Locale.ROOT);
        if (mime.contains("pdf")) return "pdf";
        if (mime.startsWith("image/")) return "image";
        if (mime.startsWith("text/") || mime.contains("csv")) return "text";

        String name = fileName == null ? "" : fileName.toLowerCase(Locale.ROOT);
        int dot = name.lastIndexOf('.');
        String ext = dot >= 0 ? name.substring(dot + 1) : "";
        return switch (ext) {
            case "pdf" -> "pdf";
            case "png", "jpg", "jpeg", "tif", "tiff", "bmp", "gif" -> "image";
            case "txt", "csv", "log", "md" -> "text";
            default -> "other";
        };
    }

    /** Collapse the ragged whitespace a text layer comes back with. */
    private String normalize(String raw) {
        if (raw == null) return "";
        return raw.replace("\r\n", "\n")
                .replaceAll("[ \\t\\x0B\\f]+", " ")
                .replaceAll("\\n{3,}", "\n\n")
                .trim();
    }
}
