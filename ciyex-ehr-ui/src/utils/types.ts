export type ApiResponse<T> = {
    success: boolean;
    message?: string;
    data?: T;
};

export type Audit = {
    createdDate?: string | number[];
    lastModifiedDate?: string | number[];
};

export type EncounterDto = {
    id?: number;
    patientId: number;
    encounterDate?: string;
    reason?: string;
    status?: "OPEN" | "CLOSED";
    audit?: Audit;
};


export type PatientMedicalHistoryDto = {
    id?: number;
    patientId: number;
    encounterId: number;
    description: string;
    audit?: {
        createdDate?: string;
        lastModifiedDate?: string;
    };
};

export type ChiefComplaintDto = {
    id?: number;
    patientId: number;
    encounterId: number;
    complaint: string;
    details?: string;
    // Your backend returns createdAt/updatedAt either as strings or arrays (e.g., [2025,8,18,0,0])
    createdAt?: string | number[];
    updatedAt?: string | number[];
};
// --- HPI (History of Present Illness) ---

// --- HPI (History of Present Illness) — compact schema ---
export type HpiDto = {
    id?: number;
    externalId?: string | null;
    orgId?: number;
    patientId: number;
    encounterId: number;

    // backend uses this single field
    description: string;

    audit?: {
        createdDate?: string;
        lastModifiedDate?: string;
    };
};


export type RosDto = {
    id?: number;
    patientId: number;
    encounterId: number;

    // Core fields
    system: string;            // e.g., "Constitutional", "Cardiovascular", "Respiratory", etc.
    status: "Positive" | "Negative" | "NotAsked";
    finding?: string;          // e.g., the specific symptom (fever, cough)
    notes?: string;            // free-text comments

    audit?: {
        createdDate?: string;
        lastModifiedDate?: string;
    };
};

export type PastMedicalHistoryDto = {
    id?: number;
    patientId: number;
    encounterId: number;

    condition: string;       // e.g., "Hypertension"
    diagnosisDate?: string;  // yyyy-MM-dd (optional)
    status?: string;         // e.g., "Active", "Resolved"
    notes?: string;          // free text

    audit?: {
        createdDate?: string;
        lastModifiedDate?: string;
    };
};

// Family History types (aligns with backend DTO)

// --- Family History ---
export type FamilyHistoryEntryDto = {
    id?: number;
    relation: "FATHER" | "MOTHER" | "SIBLING" | "SPOUSE" | "OFFSPRING";
    diagnosisCode?: string;
    diagnosisText?: string;
    notes?: string;
};

export type FamilyHistoryDto = {
    id?: number;
    externalId?: string | null;
    orgId?: number;
    patientId: number;
    encounterId: number;
    entries: FamilyHistoryEntryDto[];
    audit?: {
        createdDate?: string;
        lastModifiedDate?: string;
    };
};



// --- Social History ---

export type SocialHistoryEntryDto = {
    id?: number;
    category: string;     // e.g., "SMOKING", "DIET", ...
    value?: string;       // e.g., "Former smoker", "Vegetarian"
    details?: string;     // free text details
};

export type SocialHistoryDto = {
    id?: number;
    externalId?: string | null;
    orgId?: number;
    patientId: number;
    encounterId: number;
    entries: SocialHistoryEntryDto[];
    audit?: {
        createdDate?: string;
        lastModifiedDate?: string;
    };
};

// ---- Physical Exam ----

export type PhysicalExamSectionDto = {
    sectionKey:
        | "GENERAL"
        | "HEENT"
        | "NECK"
        | "CARDIOVASCULAR"
        | "RESPIRATORY"
        | "ABDOMEN"
        | "GENITOURINARY"
        | "MUSCULOSKELETAL"
        | "NEUROLOGICAL"
        | "SKIN"
        | "PSYCHIATRIC"
        | "OTHER"
        | string;      // allow future custom keys

    allNormal: boolean;   // true = no abnormal findings
    normalText?: string;  // e.g., “Well-nourished, no acute distress”
    findings?: string;    // e.g., “Mild nasal congestion”
};

export type PhysicalExamDto = {
    id?: number;
    externalId?: string | null;
    orgId?: number;
    patientId: number;
    encounterId: number;

    // if your backend includes an overall summary, keep it; otherwise omit:
    summary?: string;

    sections: PhysicalExamSectionDto[];

    audit?: {
        createdDate?: string;
        lastModifiedDate?: string;
    };
};



export type AssessmentDto = {
    id?: number;
    patientId: number;
    encounterId: number;

    diagnosisCode?: string;   // e.g., ICD-10 (M54.5)
    diagnosisName?: string;   // e.g., Low back pain
    status?: "Active" | "Resolved" | "RuleOut" | "Differential" | "Chronic";
    priority?: "Primary" | "Secondary" | "Tertiary";
    assessmentText?: string;  // free-text impression/assessment
    notes?: string;

    audit?: {
        createdDate?: string;
        lastModifiedDate?: string;
    };
};

// ---- Plan (aligned to backend)
export type PlanDto = {
    id?: number;
    externalId?: string | null;
    orgId?: number;
    patientId: number;
    encounterId: number;

    diagnosticPlan?: string;     // e.g., "Order CBC, CMP, Chest X-Ray."
    plan?: string;               // e.g., "Start bronchodilator..."
    notes?: string;              // free text
    followUpVisit?: string;      // e.g., "4 weeks"
    returnWorkSchool?: string;   // e.g., "Return to work on 2025-08-20"
    sectionsJson?: Record<string, any>;   // arbitrary JSON payload

    audit?: {
        createdDate?: string;
        lastModifiedDate?: string;
    };
};




export type ProviderNoteDto = {
    id?: number;
    patientId: number;
    encounterId: number;

    noteType?: string;     // e.g., "General", "Addendum", "Attending"
    content: string;       // required free-text note
    author?: string;       // provider name or ID
    signed?: boolean;      // mark as signed/finalized

    audit?: {
        createdDate?: string;
        lastModifiedDate?: string;
    };
};

// ---- Procedures (aligned to Bruno screenshot) ----
export type ProcedureDto = {
    id?: number;
    externalId?: string | null;
    orgId?: number;
    patientId: number;
    encounterId: number;

    cpt4: string;                // e.g., "99214"
    description: string;         // e.g., "Office visit est. patient comprehensive"
    units?: number;              // integer
    rate?: string;               // keep as string: "239.00"
    relatedIcds?: string;        // e.g., "E0500"
    hospitalBillingStart?: string; // "YYYY-MM-DD"
    hospitalBillingEnd?: string;   // "YYYY-MM-DD"
    modifier1?: string | null;   // e.g., "25"
    modifier2?: string | null;   // e.g., "34"
    modifier3?: string | null;
    modifier4?: string | null;
    note?: string | null;

    audit?: {
        createdDate?: string;
        lastModifiedDate?: string;
    };
};




// ---- Codes (master/detail aligned to backend screenshot) ----
export type CodeDto = {
    id?: number;
    externalId?: string | null;
    orgId?: number;
    patientId: number;
    encounterId: number;

    codeType: "CPT" | "HCPCS" | "ICD10" | "ICD10PCS" | "Modifier" | "Other" | string;
    code: string;
    modifier?: string | null;

    active: boolean;
    description?: string;
    shortDescription?: string;
    category?: string;
    diagnosisReporting?: boolean;
    serviceReporting?: boolean;
    relateTo?: string;
    feeStandard?: number;

    audit?: {
        createdDate?: string;
        lastModifiedDate?: string;
    };
};

// Generic API envelope (if not already defined)



export type SignoffStatus =
    | "Draft"
    | "ReadyForSignature"
    | "Signed"
    | "CosignRequested"
    | "Cosigned"
    | "Locked";

export type SignoffDto = {
    id?: number;
    patientId: number;
    encounterId: number;

    status: SignoffStatus;            // workflow state
    attestationText?: string;         // free text visible on the signed note
    acknowledgeBillingComplete?: boolean;
    lockEncounter?: boolean;          // lock charts upon sign

    // signature fields
    signedBy?: string;                // provider display name / id
    signedAt?: string;                // ISO/Date string
    cosigner?: string;                // optional cosigner
    cosignedAt?: string;

    // optional extra message
    notes?: string;

    audit?: {
        createdDate?: string;
        lastModifiedDate?: string;
    };
};

export type ProviderSignatureStatus = "Draft" | "Signed" | "Locked";

export type ProviderSignatureDto = {
    id?: number;
    patientId: number;
    encounterId: number;

    signatureText?: string;     // could be "Electronically signed by Dr. Smith"
    signatureImage?: string;    // optional: base64 encoded drawn signature
    signedBy?: string;          // provider name or ID
    signedAt?: string;          // ISO datetime
    status: ProviderSignatureStatus;

    audit?: {
        createdDate?: string;
        lastModifiedDate?: string;
    };
};

export type DateTimeFinalizedDto = {
    id?: number;
    patientId: number;
    encounterId: number;

    finalizedAt?: string;     // ISO string, e.g., "2025-08-23T10:45:00Z" or local ISO
    finalizedBy?: string;     // provider display name/ID
    timezone?: string;        // e.g., "Asia/Kolkata"
    locked?: boolean;         // whether encounter is locked after finalization
    source?: string;          // e.g., "Signoff", "ProviderSignature", "Manual"
    notes?: string;           // optional free text

    audit?: {
        createdDate?: string;
        lastModifiedDate?: string;
    };
};

export type AssignedProviderDto = {
    id?: number;
    patientId: number;
    encounterId: number;

    providerId: number;        // required
    providerName?: string;     // optional display name from backend
    role: "Primary" | "Attending" | "Consultant" | "Nurse" | "Scribe" | "Other";
    startDate?: string;        // yyyy-MM-dd
    endDate?: string;          // yyyy-MM-dd
    notes?: string;

    audit?: {
        createdDate?: string;
        lastModifiedDate?: string;
    };
};

export type FeeScheduleEntryDto = {
    id?: number;
    code?: string;              // CPT/HCPCS/ICD-10-PCS/etc.
    description?: string;
    modifiers?: string;         // "25,59" etc.
    units?: number;             // default 1
    unitPrice?: number;         // per unit charge
    lineTotal?: number;         // server can calc; UI also calculates
    notes?: string;
};

export type FeeScheduleDto = {
    id?: number;
    patientId: number;
    encounterId: number;

    effectiveDate?: string;     // yyyy-MM-dd
    payer?: string;             // payer/plan name (optional)
    remarks?: string;           // free text

    entries: FeeScheduleEntryDto[];

    // rollups (optional; UI calculates locally too)
    subtotal?: number;
    discount?: number;
    tax?: number;
    total?: number;

    audit?: {
        createdDate?: string;
        lastModifiedDate?: string;
    };
};

// already in your project:
// export type ApiResponse<T> = { success: boolean; message?: string; data?: T };
