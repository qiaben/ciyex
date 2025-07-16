import { getPatientFullDataById } from "@/utils/services/patient";
import { auth } from "@/utils/auth";
import PatientProfileClient from "./patient-profile-client";

interface ParamsProps {
  params: Promise<{ patientId: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

const PatientProfile = async (props: ParamsProps) => {
  // Await route params and search params (Next.js app directory conventions)
  const params = await props.params;
  const searchParams = props.searchParams ? await props.searchParams : undefined;

  // Determine the ID to fetch: either the explicit patientId, or the logged-in user if 'self'
  let id = params.patientId;
  let patientId = params.patientId;

  if (patientId === "self") {
    const { userId } = await auth();
    if (!userId) {
      return <div>Unauthorized: Please sign in to view your profile.</div>;
    }
    id = userId;
  }

  // Fetch patient data from your backend/service
  const result = await getPatientFullDataById(id);
  if (!result.success) {
    return (
        <div>
          Error loading patient: {"message" in result ? result.message : "Unknown error"}
        </div>
    );
  }

  const { data } = result as { success: true; data: any };

  // Render client component with fetched data
  return <PatientProfileClient data={data} patientId={patientId} id={id} />;
};

export default PatientProfile;
