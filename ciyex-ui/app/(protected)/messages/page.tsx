import { auth } from "@clerk/nextjs/server";
import { getPatientAppointments } from "@/utils/services/appointment";
import MessagesClient from "./MessagesClient";

export default async function MessagesPage() {
  const { userId } = await auth();
  const { data: appointments = [] } = await getPatientAppointments({
    page: 1,
    limit: 1000,
    id: userId!,
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
