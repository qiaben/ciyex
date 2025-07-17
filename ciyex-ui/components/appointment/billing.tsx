import BillingClientWrapper from "./BillingClientWrapper";
import { getBillsForAppointment, getPaymentForAppointment, getServicesData } from "@/lib/billing";
import { getCurrentUserFromToken } from "@/app/utils/auth";

// Updated: Ensure that the environment variable JWT_SECRET is set properly
export default async function Billing({ appointmentId }: { appointmentId: string }) {
    // Fetch the current user using the stored TOKEN from process.env.JWT_SECRET
    const user = await getCurrentUserFromToken();  // Since TOKEN is already in auth.ts, no need to pass it here

    if (!user) {
        throw new Error("User not found or authentication failed");
    }

    const isAdmin = user?.roles.includes("ADMIN");
    const isDoctor = user?.roles.includes("DOCTOR");

    // Fetch the appointment data
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
