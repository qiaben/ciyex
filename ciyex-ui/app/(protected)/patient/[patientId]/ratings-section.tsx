"use client";

import { PatientRatingContainer } from "../../../../components/patient-rating-container";

interface RatingsSectionProps {
  patientId: string;
}

export default function RatingsSection({ patientId }: RatingsSectionProps) {
  return <PatientRatingContainer id={patientId} />;
} 