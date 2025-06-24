interface PatientProfileClientProps {
  data: any;
  patientId: string;
  id: string;
}

declare const PatientProfileClient: (props: PatientProfileClientProps) => any;
export default PatientProfileClient; 