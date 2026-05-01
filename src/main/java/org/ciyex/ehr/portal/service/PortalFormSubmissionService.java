package org.ciyex.ehr.portal.service;

import lombok.RequiredArgsConstructor;
import org.ciyex.ehr.portal.entity.PortalFormSubmission;
import org.ciyex.ehr.portal.repository.PortalFormSubmissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PortalFormSubmissionService {

    private final PortalFormSubmissionRepository repo;

    public PortalFormSubmission submit(String orgAlias, PortalFormSubmission submission) {
        if (submission.getFormId() == null) {
            throw new IllegalArgumentException(
                    "formId is required to submit a portal form. Pick a form template before submitting.");
        }
        submission.setOrgAlias(orgAlias);
        submission.setStatus("pending");
        submission.setSubmittedDate(Instant.now());
        return repo.save(submission);
    }

    public List<PortalFormSubmission> getAll(String orgAlias) {
        return repo.findByOrgAliasOrderBySubmittedDateDesc(orgAlias);
    }

    public List<PortalFormSubmission> getPending(String orgAlias) {
        return repo.findByOrgAliasAndStatusOrderBySubmittedDateDesc(orgAlias, "pending");
    }

    public List<PortalFormSubmission> getByPatient(String orgAlias, String patientId) {
        return repo.findByOrgAliasAndPatientIdOrderBySubmittedDateDesc(orgAlias, patientId);
    }

    public List<PortalFormSubmission> getMySubmissions(String orgAlias, String patientId) {
        return repo.findByOrgAliasAndPatientIdOrderBySubmittedDateDesc(orgAlias, patientId);
    }

    @Transactional
    public PortalFormSubmission accept(String orgAlias, Long submissionId, String reviewedBy) {
        var sub = repo.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
        if (!sub.getOrgAlias().equals(orgAlias)) throw new RuntimeException("Access denied");
        sub.setStatus("accepted");
        sub.setReviewedDate(Instant.now());
        sub.setReviewedBy(reviewedBy);
        return repo.save(sub);
    }

    @Transactional
    public void reject(String orgAlias, Long submissionId, String reviewedBy, String reason) {
        var sub = repo.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
        if (!sub.getOrgAlias().equals(orgAlias)) throw new RuntimeException("Access denied");
        repo.delete(sub);
    }
}
