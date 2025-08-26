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
export type HpiDto = {
    id?: number;
    patientId: number;
    encounterId: number;

    // Keep one guaranteed field that every backend supports:
    narrative: string;

    // Optional structured fields (your backend can ignore any it doesn't use):
    onset?: string;                // e.g., "2 days ago"
    duration?: string;             // e.g., "2 days"
    severity?: string;             // e.g., "mild | moderate | severe"
    location?: string;             // e.g., "frontal head"
    character?: string;            // e.g., "throbbing"
    aggravatingFactors?: string;   // e.g., "light, noise"
    alleviatingFactors?: string;   // e.g., "rest, NSAIDs"
    associatedSymptoms?: string;   // e.g., "nausea, photophobia"
    timing?: string;               // e.g., "intermittent, worse at night"

    // audit fields if your API returns them:
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

export type FamilyHistoryDto = {
    id?: number;
    patientId: number;
    encounterId: number;

    // common fields for a single family history entry:
    relation: string;          // e.g., Father, Mother, Brother
    condition: string;         // e.g., Diabetes Mellitus Type 2
    ageOfOnset?: number;       // optional
    status?: string;           // e.g., Alive, Deceased, Unknown
    notes?: string;            // free text
    hereditary?: boolean;      // optional flag

    audit?: {
        createdDate?: string;
        lastModifiedDate?: string;
    };
};

export type SocialHistoryDto = {
    id?: number;
    patientId: number;
    encounterId: number;

    // Flexible, entry-based model (maps well to SocialHistoryEntry)
    category: string;         // e.g., "Tobacco", "Alcohol", "Drugs", "Occupation", "Exercise", "Diet", "Sexual", etc.
    status?: string;          // e.g., "Current", "Former", "Never", "Occasional"
    frequency?: string;       // e.g., "Daily", "Weekly", "Socially"
    duration?: string;        // e.g., "10 years", "2 months"
    quantityPerDay?: number;  // e.g., cigarettes/day, drinks/day (optional)
    years?: number;           // e.g., pack-years or overall years (optional)
    notes?: string;           // free text

    audit?: {
        createdDate?: string;
        lastModifiedDate?: string;
    };
};

export type PhysicalExamSectionDto = {
    name: string;         // e.g., "General", "HEENT", "Cardiovascular"
    finding?: string;     // concise result: "NAD", "Clear to auscultation", etc.
    notes?: string;       // optional detailed text
    status?: "Normal" | "Abnormal" | "NotExamined";
};

export type PhysicalExamDto = {
    id?: number;
    patientId: number;
    encounterId: number;

    // free text summary for the whole exam
    summary?: string;

    // array of sectional findings (maps well to PhysicalExamSection on backend)
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

export type PlanDto = {
    id?: number;
    patientId: number;
    encounterId: number;

    // free text plan summary
    planText?: string;

    // structured optional buckets
    medications?: string;         // e.g., "Ibuprofen 400mg po q8h prn pain x5d"
    labs?: string;                // e.g., "CBC, CMP"
    imaging?: string;             // e.g., "CXR PA/LAT"
    procedures?: string;          // e.g., "Wound debridement"
    referrals?: string;           // e.g., "PT referral; Cardiology consult"
    followUp?: string;            // e.g., "RTC 2 weeks"
    patientInstructions?: string; // e.g., "Ice, rest, return precautions"

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

export type ProcedureDto = {
    id?: number;
    patientId: number;
    encounterId: number;

    // Common fields — adjust names to your backend if needed
    procedureCode?: string;     // CPT/HCPCS/ICD-10-PCS
    procedureName: string;      // human-readable label
    datePerformed?: string;     // yyyy-MM-dd
    status?: "Planned" | "InProgress" | "Completed" | "Aborted";
    performer?: string;         // provider name or ID
    bodySite?: string;          // e.g., "Left knee"
    laterality?: "Left" | "Right" | "Bilateral" | "Midline";
    modifiers?: string;         // e.g., CPT modifiers "25,59"
    anesthesia?: string;        // e.g., "Local", "General"
    notes?: string;             // free text

    audit?: {
        createdDate?: string;
        lastModifiedDate?: string;
    };
};

// already present in your project:
// export type ApiResponse<T> = { success: boolean; message?: string; data?: T };




