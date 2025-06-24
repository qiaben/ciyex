export type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
export type Relation = "mother" | "father" | "husband" | "wife" | "other";

export const GENDER: { label: string; value: Gender }[] = [
    { label: "Male", value: "MALE" },
    { label: "Female", value: "FEMALE" },
    { label: "Other", value: "OTHER" },
    { label: "Prefer not to say", value: "PREFER_NOT_TO_SAY" },
  ];

export const RELATION: { label: string; value: Relation }[] = [
    { value: "mother", label: "Mother" },
    { value: "father", label: "Father" },
    { value: "husband", label: "Husband" },
    { value: "wife", label: "Wife" },
    { value: "other", label: "Other" },
  ];
  
export const USER_ROLES = {
    ADMIN: "ADMIN" as string,
    DOCTOR: "DOCTOR",
    PATIENT: "PATIENT",
  };