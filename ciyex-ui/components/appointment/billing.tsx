import BillingClientWrapper from "./BillingClientWrapper";
import { getBillsForAppointment, getPaymentForAppointment, getServicesData } from "@/lib/billing";
import { getCurrentUser } from "@/lib/auth";

export default async function Billing({ appointmentId }: { appointmentId: string }) {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "ADMIN";
  const isDoctor = user?.role === "DOCTOR";
  const bills = await getBillsForAppointment(appointmentId);
  const payment = await getPaymentForAppointment(appointmentId);
  const servicesData = await getServicesData();

  return (
    <BillingClientWrapper
      bills={bills}
      payment={payment}
      appointmentId={appointmentId}
      isAdmin={isAdmin}
      isDoctor={isDoctor}
      servicesData={servicesData}
    />
  );
} 