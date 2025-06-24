import { getPatientFullDataById } from "@/utils/services/patient";
import { auth } from "@clerk/nextjs/server";
import PatientProfileClient from "./patient-profile-client";

interface ParamsProps {
  params: Promise<{ patientId: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

const PatientProfile = async (props: ParamsProps) => {
  const searchParams = await props.searchParams;
  const params = await props.params;

  let id = params.patientId;
  let patientId = params.patientId;

  if (patientId === "self") {
    const { userId } = await auth();
    id = userId!;
  } else id = patientId;

  const result = await getPatientFullDataById(id);
  if (!result.success) {
    return <div>Error loading patient: {"message" in result ? result.message : "Unknown error"}</div>;
  }
  const { data } = result as { success: true; data: any };

  return <PatientProfileClient data={data} patientId={patientId} id={id} />;
};

export default PatientProfile;
