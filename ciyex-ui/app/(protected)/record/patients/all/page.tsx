import { getCurrentUserFromToken } from "@/utils/auth"; // <-- Make sure this utility exists!
import db from "@/lib/db";
import AllPatientsClient from "./all-patients-client";

export default async function AllPatientsPage() {
  // Replace Clerk with JWT util:
  const user = await getCurrentUserFromToken();
  if (!user?.id) {
    // You can return a redirect, error component, or null
    return <div>Unauthorized</div>;
  }

  // Get all appointments for this doctor
  const appointments = await db.appointment.findMany({
    where: { doctor_id: user.id },
    include: {
      patient: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          gender: true,
          img: true,
          colorCode: true,
        },
      },
    },
    orderBy: { appointment_date: "desc" },
  });

  // Unique patients by id, and count visits
  const patientMap = new Map<string, { patient: any; visits: number }>();
  for (const a of appointments) {
    if (!a.patient) continue;
    if (!patientMap.has(a.patient.id)) {
      patientMap.set(a.patient.id, { patient: a.patient, visits: 1 });
    } else {
      patientMap.get(a.patient.id)!.visits += 1;
    }
  }
  const patients = Array.from(patientMap.values()).map(({ patient, visits }) => ({ ...patient, visits }));

  return <AllPatientsClient patients={patients} />;
}
