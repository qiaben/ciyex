package org.ciyex.ehr.scanning;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.ciyex.ehr.scanning.service.DocumentTextExtractor;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * The Document Scanning table could only ever show "pending" or "processing"
 * because nothing moved a scan to a terminal state. These cover the states the
 * extractor now produces, so all five OCR status filters have reachable rows.
 */
class DocumentTextExtractorTest {

    private final DocumentTextExtractor extractor = new DocumentTextExtractor();

    private static byte[] pdfWithText(String text) throws Exception {
        try (PDDocument doc = new PDDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PDPage page = new PDPage();
            doc.addPage(page);
            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA, 12);
                cs.newLineAtOffset(72, 700);
                cs.showText(text);
                cs.endText();
            }
            doc.save(out);
            return out.toByteArray();
        }
    }

    @Test
    void pdfWithATextLayerCompletes() throws Exception {
        // The app's own statements / visit summaries are text-layer PDFs.
        DocumentTextExtractor.Result r = extractor.extract(
                pdfWithText("Patient Statement 12345"), "patient-statement.pdf", "application/pdf");
        assertEquals("completed", r.status());
        assertTrue(r.text().contains("Patient Statement 12345"), r.text());
        assertEquals(1.0d, r.confidence());
    }

    @Test
    void pdfWithNoTextLayerIsNotApplicable() throws Exception {
        try (PDDocument doc = new PDDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            doc.addPage(new PDPage());
            doc.save(out);
            DocumentTextExtractor.Result r = extractor.extract(out.toByteArray(), "scan.pdf", "application/pdf");
            assertEquals("not_applicable", r.status());
        }
    }

    @Test
    void csvCompletes() {
        DocumentTextExtractor.Result r = extractor.extract(
                "name,dob\nJane Doe,1990-01-01\n".getBytes(StandardCharsets.UTF_8),
                "issue10-test-scan.csv", "text/csv");
        assertEquals("completed", r.status());
        assertTrue(r.text().contains("Jane Doe"));
    }

    @Test
    void imageIsNotApplicableWithoutAnOcrEngine() {
        DocumentTextExtractor.Result r = extractor.extract(new byte[]{1, 2, 3}, "insurance-card.png", "image/png");
        assertEquals("not_applicable", r.status());
    }

    @Test
    void unreadablePdfFails() {
        DocumentTextExtractor.Result r = extractor.extract("not a pdf".getBytes(StandardCharsets.UTF_8),
                "broken.pdf", "application/pdf");
        assertEquals("failed", r.status());
    }

    @Test
    void emptyFileFails() {
        assertEquals("failed", extractor.extract(new byte[0], "empty.pdf", "application/pdf").status());
    }

    @Test
    void extensionIsUsedWhenTheMimeTypeIsGeneric() {
        // Browsers hand CSV uploads over as application/octet-stream often enough
        // that the classifier must fall back to the file extension.
        DocumentTextExtractor.Result r = extractor.extract(
                "a,b\n1,2\n".getBytes(StandardCharsets.UTF_8), "export.csv", "application/octet-stream");
        assertEquals("completed", r.status());
    }
}
