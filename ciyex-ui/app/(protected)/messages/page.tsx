import { getCurrentUserFromToken } from "../../utils/auth";
import { getPatientAppointments } from "@/utils/services/appointment";
import MessagesClient from "./MessagesClient";

export default async function MessagesPage() {
  // Use JWT-based auth instead of Clerk
  const user = await getCurrentUserFromToken();
    if (!user?.userId) {
    return <div>Please sign in to continue</div>;
  }

  const { data: appointments = [] } = await getPatientAppointments({
    page: 1,
    limit: 1000,
      id: String(user.userId),
  });

  const filtered = (appointments || []).filter(
      (a: any) => a.status === "SCHEDULED" || a.status === "COMPLETED"
  );
  const doctorMap = new Map();
  for (const a of filtered) {
    if (a.doctor && a.doctor.id && !doctorMap.has(a.doctor.id)) {
      doctorMap.set(a.doctor.id, a.doctor);
    }
  }
  const doctors = Array.from(doctorMap.values());

  return <MessagesClient doctors={doctors} />;
}
