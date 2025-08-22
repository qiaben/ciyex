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


